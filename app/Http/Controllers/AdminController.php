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
use App\Models\Voucher;
use App\Models\BroadcastTemplate;
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
        ];

        return Inertia::render('Admin/Dashboard', [
            'products' => $products, 'recentTransactions' => $recentTransactions,
            'stats' => $stats, 'salesChart' => Transaction::where('status', 'PAID')->where('created_at', '>=', now()->subDays(7))->selectRaw('DATE(created_at) as date, SUM(amount) as total')->groupBy('date')->orderBy('date', 'ASC')->get()
        ]);
    }

    // MONTHLY FINANCIAL REPORT (PDF)
    public function downloadMonthlyReport()
    {
        $month = now()->format('F Y');
        $transactions = Transaction::where('status', 'PAID')->whereMonth('created_at', now()->month)->with('product')->get();
        $totalRevenue = $transactions->sum('amount');
        $totalProfit = $totalRevenue - $transactions->sum(fn($tx) => $tx->product->cost_price ?? 0);
        $topProducts = Transaction::where('status', 'PAID')->whereMonth('created_at', now()->month)->select('product_id', DB::raw('count(id) as total'))->groupBy('product_id')->with('product')->orderBy('total', 'DESC')->take(5)->get();

        $pdf = Pdf::loadView('exports.monthly_report', compact('month', 'transactions', 'totalRevenue', 'totalProfit', 'topProducts'));
        ActivityLog::log("Accounting: Exported Monthly Financial Report for {$month}.");
        return $pdf->download("Empire_Report_{$month}.pdf");
    }

    // DEPOSIT LEDGER
    public function deposits()
    {
        return Inertia::render('Admin/Deposits', [
            'deposits' => Deposit::with('user')->latest()->paginate(20)
        ]);
    }

    // (CRUDs & Support Methods Integrated...)
    public function products() { return Inertia::render('Admin/Products', ['products' => Product::with('category')->get(), 'categories' => Category::all()]); }
    public function storeProduct(Request $request) { $p = Product::create($request->all()); self::alertOwner("New Product Added: {$p->name}"); return redirect()->back(); }
    public function updateProduct(Request $request, Product $product) { $product->update($request->all()); self::alertOwner("Product Updated: {$product->name}"); return redirect()->back(); }
    public function destroyProduct(Product $product) { $product->delete(); return redirect()->back(); }
    public function categories() { return Inertia::render('Admin/Categories', ['categories' => Category::withCount('products')->get()]); }
    public function storeCategory(Request $request) { Category::create($request->all()); return redirect()->back(); }
    public function destroyCategory(Category $category) { $category->delete(); return redirect()->back(); }
    public function transactions(Request $request) { $query = Transaction::with(['product', 'digitalAsset'])->latest(); if ($request->search) { $query->where('reference', 'like', "%{$request->search}%")->orWhere('chat_id', 'like', "%{$request->search}%"); } return Inertia::render('Admin/Transactions', ['transactions' => $query->paginate(20)->withQueryString(), 'filters' => $request->only(['search'])]); }
    public function exportTransactions(Request $request) { $ids = $request->ids ? explode(',', $request->ids) : null; $query = Transaction::with('product')->latest(); if ($ids) $query->whereIn('id', $ids); $transactions = $query->get(); return (new \App\Services\CsvExporter())->download($transactions, 'report.csv'); }
    public function logs() { $logPath = storage_path('logs/laravel.log'); $logs = File::exists($logPath) ? File::get($logPath) : "No logs."; $lines = explode("\n", $logs); $lastLogs = implode("\n", array_slice($lines, -150)); return Inertia::render('Admin/Logs', [ 'system_logs' => $lastLogs, 'audit_logs' => ActivityLog::latest()->paginate(50) ]); }
    public function settings() { return Inertia::render('Admin/Settings', [ 'settings' => Setting::all()->pluck('value', 'key') ]); }
    public function updateSettings(Request $request) { foreach ($request->all() as $k => $v) Setting::set($k, $v); return redirect()->back(); }
    public function users() { $users = TelegramUser::with(['transactions' => function($q) { $q->with('product')->latest(); }])->withCount(['transactions as paid_count' => function($q) { $q->where('status', 'PAID'); }])->latest()->paginate(20); return Inertia::render('Admin/Users', [ 'users' => $users ]); }
    public function adjustBalance(Request $request, TelegramUser $user) { $user->increment('balance', $request->amount); self::alertOwner("Manual Credit: @{$user->username} +{$request->amount}"); return redirect()->back(); }
    public function broadcastPage() { return Inertia::render('Admin/Broadcast', [ 'total_users' => TelegramUser::count(), 'templates' => BroadcastTemplate::latest()->get() ]); }
    public function sendBroadcast(Request $request) { $users = TelegramUser::all(); $token = env('TELEGRAM_BOT_TOKEN'); foreach ($users as $u) { Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $u->chat_id, 'text' => $request->message, 'parse_mode' => 'HTML']); } return redirect()->back(); }
    public function storeTemplate(Request $request) { BroadcastTemplate::create($request->all()); return redirect()->back(); }
    public function destroyTemplate(BroadcastTemplate $template) { $template->delete(); return redirect()->back(); }
    public function stockOpname() { return Inertia::render('Admin/StockOpname', ['products' => Product::where('is_active', true)->get()]); }
    public function bulkInsertAssets(Request $request) { $count = 0; if ($request->assets_data) { $lines = explode("\n", $request->assets_data); foreach ($lines as $line) { if (trim($line)) { DigitalAsset::create(['product_id' => $request->product_id, 'data_detail' => trim($line)]); $count++; } } } if ($count > 0) { $p = Product::find($request->product_id); $this->notifyWaitlist($p); } return redirect()->back(); }
    protected function notifyWaitlist($product) { $wait = RestockNotification::where('product_id', $product->id)->where('is_notified', false)->get(); foreach ($wait as $w) { $token = env('TELEGRAM_BOT_TOKEN'); Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $w->chat_id, 'text' => "⚡ <b>RESTOCK:</b> {$product->name} available now!", 'parse_mode' => 'HTML']); $w->update(['is_notified' => true]); } }
    public static function alertOwner($action) { $ownerId = Setting::get('admin_chat_id'); if ($ownerId) { $token = env('TELEGRAM_BOT_TOKEN'); Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $ownerId, 'text' => "🛡️ <b>WATCHDOG:</b> {$action}", 'parse_mode' => 'HTML']); } }
}
