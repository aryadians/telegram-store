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
use App\Models\Rating;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminController extends Controller
{
    public function dashboard()
    {
        $products = Product::withCount(['digitalAssets as total_stock' => function($query) { $query->where('is_used', false); }])->get();
        $recentTransactions = Transaction::with('product')->latest()->take(10)->get();
        $stats = [
            'total_revenue' => (float) Transaction::where('status', 'PAID')->sum('amount'),
            'total_profit' => (float) (Transaction::where('status', 'PAID')->sum('amount') - Transaction::where('status', 'PAID')->join('products', 'transactions.product_id', '=', 'products.id')->sum('products.cost_price')),
            'total_users' => TelegramUser::count(),
            'avg_rating' => Rating::avg('stars') ?: 0,
            'pending_orders' => Transaction::where('status', 'UNPAID')->count(),
            'new_users_today' => TelegramUser::whereDate('created_at', now()->toDateString())->count(),
            'aov' => Transaction::where('status', 'PAID')->count() > 0 ? (float) Transaction::where('status', 'PAID')->avg('amount') : 0,
        ];
        return Inertia::render('Admin/Dashboard', ['products' => $products, 'recentTransactions' => $recentTransactions, 'stats' => $stats, 'salesChart' => Transaction::where('status', 'PAID')->where('created_at', '>=', now()->subDays(7))->selectRaw('DATE(created_at) as date, SUM(amount) as total')->groupBy('date')->orderBy('date', 'ASC')->get()]);
    }

    public function products() { return Inertia::render('Admin/Products', ['products' => Product::with('category')->get(), 'categories' => Category::all()]); }
    public function storeProduct(Request $request) { $p = Product::create($request->all()); ActivityLog::log("Created: {$p->name}"); self::alertOwner("Produk Baru: {$p->name}"); return redirect()->back(); }
    public function updateProduct(Request $request, Product $product) { $product->update($request->all()); ActivityLog::log("Updated: {$product->name}"); self::alertOwner("Produk Update: {$product->name}"); return redirect()->back(); }
    public function destroyProduct(Product $product) { ActivityLog::log("Deleted: {$product->name}"); $product->delete(); return redirect()->back(); }
    
    public function categories() { return Inertia::render('Admin/Categories', ['categories' => Category::withCount('products')->get()]); }
    public function storeCategory(Request $request) { Category::create($request->all()); return redirect()->back(); }
    public function destroyCategory(Category $category) { $category->delete(); return redirect()->back(); }

    public function transactions(Request $request) { $query = Transaction::with(['product', 'digitalAsset'])->latest(); if ($request->search) { $query->where('reference', 'like', "%{$request->search}%")->orWhere('chat_id', 'like', "%{$request->search}%"); } return Inertia::render('Admin/Transactions', ['transactions' => $query->paginate(20)->withQueryString(), 'filters' => $request->only(['search'])]); }
    public function exportTransactions(Request $request) { $ids = $request->ids ? explode(',', $request->ids) : null; $query = Transaction::with('product')->latest(); if ($ids) $query->whereIn('id', $ids); $transactions = $query->get(); $type = $request->type ?? 'csv'; if ($type === 'pdf') { $logoPath = public_path('logostore.png'); $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : ''; return Pdf::loadView('exports.transactions', compact('transactions', 'logoBase64'))->download('report.pdf'); } return (new \App\Services\CsvExporter())->download($transactions, 'report.csv'); }
    public function bulkDeleteTransactions(Request $request) { Transaction::whereIn('id', $request->ids)->delete(); return redirect()->back(); }

    public function logs() { $logPath = storage_path('logs/laravel.log'); $logs = File::exists($logPath) ? File::get($logPath) : "No logs."; $lines = explode("\n", $logs); $lastLogs = implode("\n", array_slice($lines, -150)); return Inertia::render('Admin/Logs', [ 'system_logs' => $lastLogs, 'audit_logs' => ActivityLog::latest()->paginate(50) ]); }
    public function settings() { return Inertia::render('Admin/Settings', [ 'settings' => Setting::all()->pluck('value', 'key') ]); }
    public function updateSettings(Request $request) { foreach ($request->all() as $k => $v) Setting::set($k, $v); self::alertOwner("Settings Updated"); return redirect()->back(); }
    public function downloadBackup() { $db = env('DB_DATABASE'); $user = env('DB_USERNAME'); $pass = env('DB_PASSWORD'); $file = "backup-".time().".sql"; $path = storage_path("app/".$file); exec("mysqldump --user={$user} --password={$pass} {$db} > {$path}"); return Response::download($path)->deleteFileAfterSend(true); }
    public function checkWebhook() { $token = env('TELEGRAM_BOT_TOKEN'); $res = Http::get("https://api.telegram.org/bot{$token}/getWebhookInfo"); return $res->successful() ? redirect()->back() : redirect()->back()->withErrors(['webhook' => 'Failed']); }
    public function cleanupInvoices() { Transaction::where('status', 'UNPAID')->where('created_at', '<', now()->subHours(24))->delete(); return redirect()->back(); }

    public function broadcastPage() { return Inertia::render('Admin/Broadcast', ['total_users' => TelegramUser::count()]); }
    public function sendBroadcast(Request $request) { $users = TelegramUser::all(); foreach ($users as $u) { $token = env('TELEGRAM_BOT_TOKEN'); Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $u->chat_id, 'text' => $request->message, 'parse_mode' => 'HTML']); } return redirect()->back(); }

    public function stockOpname() { return Inertia::render('Admin/StockOpname', ['products' => Product::where('is_active', true)->get()]); }
    public function bulkInsertAssets(Request $request) { $count = 0; if ($request->assets_data) { $lines = explode("\n", $request->assets_data); foreach ($lines as $line) { if (trim($line)) { DigitalAsset::create(['product_id' => $request->product_id, 'data_detail' => trim($line)]); $count++; } } } if ($count > 0) { $p = Product::find($request->product_id); $this->notifyWaitlist($p); } return redirect()->back(); }
    protected function notifyWaitlist($product) { $wait = RestockNotification::where('product_id', $product->id)->where('is_notified', false)->get(); foreach ($wait as $w) { $token = env('TELEGRAM_BOT_TOKEN'); Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $w->chat_id, 'text' => "⚡ <b>READY:</b> {$product->name} sudah restock!", 'parse_mode' => 'HTML']); $w->update(['is_notified' => true]); } }

    public function users() { return Inertia::render('Admin/Users', ['users' => TelegramUser::latest()->paginate(20)]); }
    public function adjustBalance(Request $request, TelegramUser $user) { $user->increment('balance', $request->amount); self::alertOwner("Saldo @{$user->username} : +{$request->amount}"); return redirect()->back(); }

    public function vouchers() { return Inertia::render('Admin/Vouchers', ['vouchers' => Voucher::latest()->get()]); }
    public function storeVoucher(Request $request) { Voucher::create($request->all()); return redirect()->back(); }
    public function destroyVoucher(Voucher $voucher) { $voucher->delete(); return redirect()->back(); }

    public function faqs() { return Inertia::render('Admin/Faqs', ['faqs' => Faq::latest()->get()]); }
    public function storeFaq(Request $request) { Faq::create($request->all()); return redirect()->back(); }
    public function destroyFaq(Faq $faq) { $faq->delete(); return redirect()->back(); }

    public static function alertOwner($action) { $ownerId = Setting::get('admin_chat_id'); if ($ownerId) { $token = env('TELEGRAM_BOT_TOKEN'); Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $ownerId, 'text' => "🛡️ <b>EMPIRE LOG:</b> {$action}", 'parse_mode' => 'HTML']); } }
}
