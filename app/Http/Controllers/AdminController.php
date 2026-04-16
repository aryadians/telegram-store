<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $products = Product::withCount(['digitalAssets as total_stock' => function($query) {
            $query->where('is_used', false);
        }])->get();

        $recentTransactions = Transaction::with('product')->latest()->take(10)->get();

        // Data untuk Grafik (7 Hari Terakhir)
        $salesChart = Transaction::where('status', 'PAID')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        $stats = [
            'total_revenue' => Transaction::where('status', 'PAID')->sum('amount'),
            'total_orders' => Transaction::where('status', 'PAID')->count(),
            'pending_orders' => Transaction::where('status', 'UNPAID')->count(),
            'total_users' => TelegramUser::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'products' => $products,
            'recentTransactions' => $recentTransactions,
            'stats' => $stats,
            'salesChart' => $salesChart
        ]);
    }

    public function exportTransactions()
    {
        $transactions = Transaction::with('product')->latest()->get();
        $csvExporter = new \App\Services\CsvExporter();
        return $csvExporter->download($transactions, 'transactions-report-' . date('Y-m-d') . '.csv');
    }

    // PRODUCT MANAGEMENT
    public function products()
    {
        return Inertia::render('Admin/Products', [
            'products' => Product::with('category')->get(),
            'categories' => Category::all()
        ]);
    }

    public function storeProduct(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:products',
            'price' => 'required|numeric',
            'category_id' => 'nullable|exists:categories,id'
        ]);

        Product::create($request->all());
        return redirect()->back()->with('success', 'Product created successfully');
    }

    public function updateProductStatus(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);
        return redirect()->back()->with('success', 'Status updated');
    }

    public function destroyProduct(Product $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted');
    }

    // CATEGORY MANAGEMENT
    public function categories()
    {
        return Inertia::render('Admin/Categories', [
            'categories' => Category::withCount('products')->get()
        ]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate(['name' => 'required']);
        Category::create($request->all());
        return redirect()->back();
    }

    public function destroyCategory(Category $category)
    {
        $category->delete();
        return redirect()->back();
    }

    // BROADCAST SYSTEM
    public function broadcastPage()
    {
        return Inertia::render('Admin/Broadcast', [
            'total_users' => TelegramUser::count()
        ]);
    }

    public function sendBroadcast(Request $request)
    {
        $request->validate(['message' => 'required']);
        
        $users = TelegramUser::all();
        $token = env('TELEGRAM_BOT_TOKEN');
        $sent = 0;

        foreach ($users as $user) {
            $response = Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $user->chat_id,
                'text' => $request->message,
                'parse_mode' => 'HTML'
            ]);
            if ($response->successful()) $sent++;
        }

        return redirect()->back()->with('success', "Pesan berhasil terkirim ke {$sent} user.");
    }

    // STOCK OPNAME
    public function stockOpname()
    {
        return Inertia::render('Admin/StockOpname', [
            'products' => Product::where('is_active', true)->get()
        ]);
    }

    public function bulkInsertAssets(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'assets_data' => 'required',
        ]);

        $assets = explode("\n", str_replace("\r", "", $request->assets_data));
        foreach ($assets as $asset) {
            $asset = trim($asset);
            if (!empty($asset)) {
                DigitalAsset::create([
                    'product_id' => $request->product_id,
                    'data_detail' => $asset,
                    'is_used' => false
                ]);
            }
        }

        return redirect()->back()->with('success', 'Assets inserted successfully');
    }

    public function transactions()
    {
        return Inertia::render('Admin/Transactions', [
            'transactions' => Transaction::with('product')->latest()->paginate(20)
        ]);
    }
}
