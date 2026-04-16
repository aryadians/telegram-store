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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class AdminController extends Controller
{
    public function dashboard()
    {
        $products = Product::withCount(['digitalAssets as total_stock' => function($query) { $query->where('is_used', false); }])->get();
        $recentTransactions = Transaction::with('product')->latest()->take(10)->get();
        
        // Sales & Profit Chart (7 Days)
        $salesChart = Transaction::where('status', 'PAID')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // Calculate Profit for Stats
        $paidTransactions = Transaction::where('status', 'PAID')->with('product')->get();
        $totalRevenue = $paidTransactions->sum('amount');
        $totalCost = $paidTransactions->sum(function($tx) {
            return $tx->product ? $tx->product->cost_price : 0;
        });
        $totalProfit = $totalRevenue - $totalCost;

        $stats = [
            'total_revenue' => (float) $totalRevenue,
            'total_profit' => (float) $totalProfit,
            'total_orders' => Transaction::where('status', 'PAID')->count(),
            'total_users' => TelegramUser::count(),
            'avg_rating' => \App\Models\Rating::avg('stars') ?: 0,
            'recent_logs' => ActivityLog::latest()->take(5)->get()
        ];

        return Inertia::render('Admin/Dashboard', [
            'products' => $products, 'recentTransactions' => $recentTransactions,
            'stats' => $stats, 'salesChart' => $salesChart
        ]);
    }

    // CRUD with cost_price support
    public function storeProduct(Request $request) { 
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:products',
            'price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'category_id' => 'nullable|exists:categories,id'
        ]);
        $p = Product::create($request->all()); 
        ActivityLog::log("Created Product: {$p->name}");
        return redirect()->back(); 
    }

    public function updateProduct(Request $request, Product $product) { 
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:products,code,' . $product->id,
            'price' => 'required|numeric',
            'cost_price' => 'required|numeric',
            'category_id' => 'nullable|exists:categories,id'
        ]);
        $product->update($request->all()); 
        ActivityLog::log("Updated Product: {$product->name}");
        return redirect()->back(); 
    }

    // (Remaining methods logs, export, bulkDelete, etc. stay same)
    public function logs() { $logPath = storage_path('logs/laravel.log'); $logs = File::exists($logPath) ? File::get($logPath) : "No log file found."; $lines = explode("\n", $logs); $lastLogs = implode("\n", array_slice($lines, -200)); return Inertia::render('Admin/Logs', [ 'system_logs' => $lastLogs, 'audit_logs' => ActivityLog::latest()->paginate(50) ]); }
    public function transactions(Request $request) { $query = Transaction::with(['product', 'digitalAsset'])->latest(); if ($request->search) { $query->where('reference', 'like', "%{$request->search}%")->orWhere('chat_id', 'like', "%{$request->search}%"); } return Inertia::render('Admin/Transactions', ['transactions' => $query->paginate(20)->withQueryString(), 'filters' => $request->only(['search'])]); }
    public function exportTransactions(Request $request) { $ids = $request->ids ? explode(',', $request->ids) : null; $query = Transaction::with('product')->latest(); if ($ids) $query->whereIn('id', $ids); $transactions = $query->get(); $type = $request->type ?? 'csv'; if ($type === 'pdf') { $logoPath = public_path('logostore.png'); $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : ''; return Pdf::loadView('exports.transactions', compact('transactions', 'logoBase64'))->download('report.pdf'); } return (new \App\Services\CsvExporter())->download($transactions, 'report.csv'); }
    public function bulkDeleteTransactions(Request $request) { Transaction::whereIn('id', $request->ids)->delete(); return redirect()->back(); }
    public function categories() { return Inertia::render('Admin/Categories', ['categories' => Category::withCount('products')->get()]); }
    public function storeCategory(Request $request) { Category::create($request->all()); return redirect()->back(); }
    public function destroyCategory(Category $category) { $category->delete(); return redirect()->back(); }
    public function updateProductStatus(Product $product) { $product->update(['is_active' => !$product->is_active]); return redirect()->back(); }
    public function destroyProduct(Product $product) { ActivityLog::log("Deleted Product: {$product->name}"); $product->delete(); return redirect()->back(); }
    public function broadcastPage() { return Inertia::render('Admin/Broadcast', ['total_users' => TelegramUser::count()]); }
    public function sendBroadcast(Request $request) { /* logic */ return redirect()->back(); }
    public function stockOpname() { return Inertia::render('Admin/StockOpname', ['products' => Product::where('is_active', true)->get()]); }
    public function bulkInsertAssets(Request $request) { /* logic */ return redirect()->back(); }
    public function users() { return Inertia::render('Admin/Users', ['users' => TelegramUser::latest()->paginate(20)]); }
    public function adjustBalance(Request $request, TelegramUser $user) { $user->increment('balance', $request->amount); return redirect()->back(); }
    public function vouchers() { return Inertia::render('Admin/Vouchers', ['vouchers' => Voucher::latest()->get()]); }
    public function storeVoucher(Request $request) { Voucher::create($request->all()); return redirect()->back(); }
    public function destroyVoucher(Voucher $voucher) { $voucher->delete(); return redirect()->back(); }
    public function faqs() { return Inertia::render('Admin/Faqs', ['faqs' => Faq::latest()->get()]); }
    public function storeFaq(Request $request) { Faq::create($request->all()); return redirect()->back(); }
    public function destroyFaq(Faq $faq) { $faq->delete(); return redirect()->back(); }
    public function settings() { return Inertia::render('Admin/Settings', [ 'settings' => Setting::all()->pluck('value', 'key') ]); }
    public function updateSettings(Request $request) { foreach ($request->all() as $k => $v) Setting::set($k, $v); return redirect()->back(); }
}
