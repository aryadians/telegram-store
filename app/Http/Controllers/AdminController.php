<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
use App\Models\Voucher;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        // 1. Stock Monitoring
        $products = Product::withCount(['digitalAssets as total_stock' => function($query) {
            $query->where('is_used', false);
        }])->get();

        // 2. Recent Activity
        $recentTransactions = Transaction::with('product')->latest()->take(10)->get();

        // 3. Sales Chart (7 Days)
        $salesChart = Transaction::where('status', 'PAID')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 4. Top Selling Products (NEW)
        $topProducts = Transaction::where('status', 'PAID')
            ->select('product_id', DB::raw('SUM(amount) as total_revenue'), DB::raw('COUNT(*) as total_sold'))
            ->groupBy('product_id')
            ->with('product')
            ->orderBy('total_revenue', 'DESC')
            ->take(5)
            ->get();

        // 5. Global Stats
        $stats = [
            'total_revenue' => Transaction::where('status', 'PAID')->sum('amount'),
            'total_orders' => Transaction::where('status', 'PAID')->count(),
            'pending_orders' => Transaction::where('status', 'UNPAID')->count(),
            'total_users' => TelegramUser::count(),
            'new_users_today' => TelegramUser::whereDate('created_at', now()->toDateString())->count(),
            'aov' => Transaction::where('status', 'PAID')->count() > 0 
                     ? Transaction::where('status', 'PAID')->avg('amount') 
                     : 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'products' => $products,
            'recentTransactions' => $recentTransactions,
            'stats' => $stats,
            'salesChart' => $salesChart,
            'topProducts' => $topProducts
        ]);
    }

    public function transactions(Request $request)
    {
        $query = Transaction::with('product')->latest();
        if ($request->search) {
            $query->where('reference', 'like', "%{$request->search}%")
                  ->orWhere('chat_id', 'like', "%{$request->search}%");
        }
        return Inertia::render('Admin/Transactions', [
            'transactions' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function exportTransactions(Request $request)
    {
        $ids = $request->ids ? explode(',', $request->ids) : null;
        $query = Transaction::with('product')->latest();
        if ($ids) $query->whereIn('id', $ids);
        $transactions = $query->get();
        $type = $request->type ?? 'csv';

        if ($type === 'pdf') {
            $logoPath = public_path('logostore.png');
            $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : '';
            return Pdf::loadView('exports.transactions', compact('transactions', 'logoBase64'))->download('report.pdf');
        }

        return (new \App\Services\CsvExporter())->download($transactions, 'report.csv');
    }

    public function bulkDeleteTransactions(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        Transaction::whereIn('id', $request->ids)->delete();
        return redirect()->back();
    }

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
    public function settings() { return Inertia::render('Admin/Settings', [ 'settings' => Setting::all()->pluck('value', 'key') ]); }
    public function updateSettings(Request $request) { foreach ($request->all() as $k => $v) Setting::set($k, $v); return redirect()->back(); }

    // FAQ MANAGEMENT
    public function faqs()
    {
        return Inertia::render('Admin/Faqs', [
            'faqs' => Faq::latest()->get()
        ]);
    }

    public function storeFaq(Request $request)
    {
        $request->validate(['question' => 'required', 'answer' => 'required']);
        Faq::create($request->all());
        return redirect()->back()->with('success', 'FAQ added');
    }

    public function destroyFaq(Faq $faq)
    {
        $faq->delete();
        return redirect()->back()->with('success', 'FAQ deleted');
    }
}
