<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
use App\Models\Setting;
use App\Models\ActivityLog;
use App\Models\RestockNotification;
use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class AdminController extends Controller
{
    public function dashboard()
    {
        $products = Product::withCount(['digitalAssets as total_stock' => function($query) { $query->where('is_used', false); }])->get();
        $recentTransactions = Transaction::with('product')->latest()->take(10)->get();
        $salesChart = Transaction::where('status', 'PAID')->where('created_at', '>=', now()->subDays(7))->selectRaw('DATE(created_at) as date, SUM(amount) as total')->groupBy('date')->orderBy('date', 'ASC')->get();

        $stats = [
            'total_revenue' => (float) Transaction::where('status', 'PAID')->sum('amount'),
            'total_profit' => (float) (Transaction::where('status', 'PAID')->sum('amount') - Transaction::where('status', 'PAID')->join('products', 'transactions.product_id', '=', 'products.id')->sum('products.cost_price')),
            'total_users' => TelegramUser::count(),
            'avg_rating' => \App\Models\Rating::avg('stars') ?: 0,
            'top_referrers' => TelegramUser::select('first_name', DB::raw('count(id) as total_refs'))
                ->whereNotNull('referred_by')
                ->groupBy('first_name')
                ->orderBy('total_refs', 'DESC')
                ->take(5)
                ->get()
        ];

        return Inertia::render('Admin/Dashboard', [
            'products' => $products, 'recentTransactions' => $recentTransactions,
            'stats' => $stats, 'salesChart' => $salesChart
        ]);
    }

    // TRIGGER WAITLIST ON STOCK INJECTION
    public function bulkInsertAssets(Request $request)
    {
        $request->validate(['product_id' => 'required', 'assets_data' => 'nullable']);
        $productId = $request->product_id;
        $count = 0;

        if ($request->assets_data) {
            $lines = explode("\n", $request->assets_data);
            foreach ($lines as $line) {
                if (trim($line)) {
                    DigitalAsset::create(['product_id' => $productId, 'data_detail' => trim($line)]);
                    $count++;
                }
            }
        }

        if ($count > 0) {
            $product = Product::find($productId);
            ActivityLog::log("Restock: Injected {$count} items for {$product->name}");
            $this->notifyWaitlist($product);
        }

        return redirect()->back();
    }

    protected function notifyWaitlist($product)
    {
        $waitlist = RestockNotification::where('product_id', $product->id)->where('is_notified', false)->get();
        foreach ($waitlist as $entry) {
            $msg = "⚡ <b>STOK READY!</b>\n\nProduk <b>{$product->name}</b> yang Anda tunggu sudah tersedia kembali. Segera amankan sebelum kehabisan!";
            $this->sendBotMessage($entry->chat_id, $msg);
            $entry->update(['is_notified' => true]);
        }
    }

    // SECURITY ALERT TO OWNER
    public static function alertOwner($action)
    {
        $ownerId = Setting::get('admin_chat_id');
        if ($ownerId) {
            $msg = "🛡️ <b>ADMIN SECURITY ALERT</b>\n\nAction: <i>{$action}</i>\nTime: " . now()->toDateTimeString();
            (new self)->sendBotMessage($ownerId, $msg);
        }
    }

    // CLEANUP UNPAID INVOICES (Manual/Task)
    public function cleanupInvoices()
    {
        $count = Transaction::where('status', 'UNPAID')->where('created_at', '<', now()->subHours(24))->delete();
        ActivityLog::log("System: Cleaned up {$count} old unpaid invoices.");
        return redirect()->back();
    }

    protected function sendBotMessage($chatId, $text) {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $chat_id, 'text' => $text, 'parse_mode' => 'HTML']);
    }

    // (CRUDs & Settings stay same with integrated alertOwner calls...)
    public function updateProduct(Request $request, Product $product) { $product->update($request->all()); self::alertOwner("Product Updated: {$product->name}"); return redirect()->back(); }
    public function adjustBalance(Request $request, TelegramUser $user) { $user->increment('balance', $request->amount); self::alertOwner("Balance Adjusted for {$user->first_name}: +{$request->amount}"); return redirect()->back(); }
    
    // (Other methods...)
    public function settings() { return Inertia::render('Admin/Settings', [ 'settings' => Setting::all()->pluck('value', 'key') ]); }
    public function updateSettings(Request $request) { foreach ($request->all() as $k => $v) Setting::set($k, $v); self::alertOwner("System Settings Updated"); return redirect()->back(); }
    public function transactions(Request $request) { $query = Transaction::with(['product', 'digitalAsset'])->latest(); if ($request->search) { $query->where('reference', 'like', "%{$request->search}%")->orWhere('chat_id', 'like', "%{$request->search}%"); } return Inertia::render('Admin/Transactions', ['transactions' => $query->paginate(20)->withQueryString(), 'filters' => $request->only(['search'])]); }
    public function logs() { $logPath = storage_path('logs/laravel.log'); $logs = File::exists($logPath) ? File::get($logPath) : "No logs."; $lines = explode("\n", $logs); $lastLogs = implode("\n", array_slice($lines, -150)); return Inertia::render('Admin/Logs', [ 'system_logs' => $lastLogs, 'audit_logs' => ActivityLog::latest()->paginate(50) ]); }
    public function categories() { return Inertia::render('Admin/Categories', ['categories' => Category::withCount('products')->get()]); }
    // WEBHOOK DIAGNOSTICS
    public function checkWebhook()
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        $response = Http::get("https://api.telegram.org/bot{$token}/getWebhookInfo");
        if ($response->successful()) {
            ActivityLog::log("Apex: Admin performed a Webhook Diagnostic.");
            return redirect()->back();
        }
        return redirect()->back()->withErrors(['webhook' => 'Failed to connect.']);
    }

    public function products()
 { return Inertia::render('Admin/Products', ['products' => Product::with('category')->get(), 'categories' => Category::all()]); }
    public function users() { return Inertia::render('Admin/Users', ['users' => TelegramUser::latest()->paginate(20)]); }
    public function vouchers() { return Inertia::render('Admin/Vouchers', ['vouchers' => Voucher::latest()->get()]); }
    public function faqs() { return Inertia::render('Admin/Faqs', ['faqs' => Faq::latest()->get()]); }
}
