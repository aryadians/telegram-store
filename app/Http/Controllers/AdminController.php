<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
use App\Models\Voucher;
use App\Models\Setting;
use App\Models\ActivityLog;
use App\Models\Faq;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

class AdminController extends Controller
{
    public function dashboard()
    {
        $products = Product::withCount(['digitalAssets as total_stock' => function($query) { $query->where('is_used', false); }])->get();
        $recentTransactions = Transaction::with('product')->latest()->take(10)->get();
        $salesChart = Transaction::where('status', 'PAID')->where('created_at', '>=', now()->subDays(7))->selectRaw('DATE(created_at) as date, SUM(amount) as total')->groupBy('date')->orderBy('date', 'ASC')->get();
        $topProducts = Transaction::where('status', 'PAID')->select('product_id', DB::raw('SUM(amount) as total_revenue'))->groupBy('product_id')->with('product')->orderBy('total_revenue', 'DESC')->take(5)->get();

        $stats = [
            'total_revenue' => (float) Transaction::where('status', 'PAID')->sum('amount'),
            'total_profit' => (float) (Transaction::where('status', 'PAID')->sum('amount') - Transaction::where('status', 'PAID')->join('products', 'transactions.product_id', '=', 'products.id')->sum('products.cost_price')),
            'total_orders' => Transaction::where('status', 'PAID')->count(),
            'total_users' => TelegramUser::count(),
            'avg_rating' => Rating::avg('stars') ?: 0,
            'pending_orders' => Transaction::where('status', 'UNPAID')->count(),
            'new_users_today' => TelegramUser::whereDate('created_at', now()->toDateString())->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'products' => $products, 'recentTransactions' => $recentTransactions,
            'stats' => $stats, 'salesChart' => $salesChart, 'topProducts' => $topProducts
        ]);
    }

    // CMS SETTINGS LOADER
    public function settings()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => Setting::all()->pluck('value', 'key')
        ]);
    }

    // DATABASE BACKUP
    public function downloadBackup()
    {
        $databaseName = env('DB_DATABASE');
        $userName = env('DB_USERNAME');
        $password = env('DB_PASSWORD');
        $fileName = "backup-" . date('Y-m-d-H-i-s') . ".sql";
        $filePath = storage_path("app/" . $fileName);

        // Command for MySQL Dump (assuming it's in path)
        $command = "mysqldump --user={$userName} --password={$password} {$databaseName} > {$filePath}";
        
        exec($command);

        if (File::exists($filePath)) {
            ActivityLog::log("System: Admin downloaded a full database backup.");
            return Response::download($filePath)->deleteFileAfterSend(true);
        }

        return redirect()->back()->with('error', 'Backup failed. Ensure mysqldump is installed.');
    }

    // (CRUD methods stay safe...)
    public function updateSettings(Request $request) { foreach ($request->all() as $k => $v) Setting::set($k, $v); return redirect()->back(); }
    public function logs() { $logPath = storage_path('logs/laravel.log'); $logs = File::exists($logPath) ? File::get($logPath) : "No logs."; $lines = explode("\n", $logs); $lastLogs = implode("\n", array_slice($lines, -150)); return Inertia::render('Admin/Logs', [ 'system_logs' => $lastLogs, 'audit_logs' => ActivityLog::latest()->paginate(50) ]); }
    public function transactions(Request $request) { $query = Transaction::with(['product', 'digitalAsset'])->latest(); if ($request->search) { $query->where('reference', 'like', "%{$request->search}%")->orWhere('chat_id', 'like', "%{$request->search}%"); } return Inertia::render('Admin/Transactions', ['transactions' => $query->paginate(20)->withQueryString(), 'filters' => $request->only(['search'])]); }
    public function exportTransactions(Request $request) { $ids = $request->ids ? explode(',', $request->ids) : null; $query = Transaction::with('product')->latest(); if ($ids) $query->whereIn('id', $ids); $transactions = $query->get(); $type = $request->type ?? 'csv'; if ($type === 'pdf') { $logoPath = public_path('logostore.png'); $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : ''; return Pdf::loadView('exports.transactions', compact('transactions', 'logoBase64'))->download('report.pdf'); } return (new \App\Services\CsvExporter())->download($transactions, 'report.csv'); }
    public function products() { return Inertia::render('Admin/Products', ['products' => Product::with('category')->get(), 'categories' => Category::all()]); }
    public function storeProduct(Request $request) { Product::create($request->all()); return redirect()->back(); }
    public function updateProduct(Request $request, Product $product) { $product->update($request->all()); return redirect()->back(); }
    public function updateProductStatus(Product $product) { $product->update(['is_active' => !$product->is_active]); return redirect()->back(); }
    public function destroyProduct(Product $product) { $product->delete(); return redirect()->back(); }
    public function categories() { return Inertia::render('Admin/Categories', ['categories' => Category::withCount('products')->get()]); }
    public function storeCategory(Request $request) { Category::create($request->all()); return redirect()->back(); }
    public function destroyCategory(Category $category) { $category->delete(); return redirect()->back(); }
    public function broadcastPage() { return Inertia::render('Admin/Broadcast', ['total_users' => TelegramUser::count()]); }
    public function sendBroadcast(Request $request) { /* Broadcast */ return redirect()->back(); }
    public function stockOpname() { return Inertia::render('Admin/StockOpname', ['products' => Product::where('is_active', true)->get()]); }
    public function bulkInsertAssets(Request $request) { /* Inject */ return redirect()->back(); }
    public function users() { return Inertia::render('Admin/Users', ['users' => TelegramUser::latest()->paginate(20)]); }
    public function adjustBalance(Request $request, TelegramUser $user) { $user->increment('balance', $request->amount); return redirect()->back(); }
    public function vouchers() { return Inertia::render('Admin/Vouchers', ['vouchers' => Voucher::latest()->get()]); }
    public function storeVoucher(Request $request) { Voucher::create($request->all()); return redirect()->back(); }
    public function destroyVoucher(Voucher $voucher) { $voucher->delete(); return redirect()->back(); }
    public function faqs() { return Inertia::render('Admin/Faqs', ['faqs' => Faq::latest()->get()]); }
    public function storeFaq(Request $request) { Faq::create($request->all()); return redirect()->back(); }
    public function destroyFaq(Faq $faq) { $faq->delete(); return redirect()->back(); }
}
