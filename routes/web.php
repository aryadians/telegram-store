<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    
    Route::get('/admin/products', [AdminController::class, 'products'])->name('admin.products');
    Route::post('/admin/products', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::put('/admin/products/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
    Route::patch('/admin/products/{product}/status', [AdminController::class, 'updateProductStatus'])->name('admin.products.status');
    Route::delete('/admin/products/{product}', [AdminController::class, 'destroyProduct'])->name('admin.products.destroy');

    Route::get('/admin/categories', [AdminController::class, 'categories'])->name('admin.categories');
    Route::post('/admin/categories', [AdminController::class, 'storeCategory'])->name('admin.categories.store');
    Route::delete('/admin/categories/{category}', [AdminController::class, 'destroyCategory'])->name('admin.categories.destroy');

    Route::get('/admin/broadcast', [AdminController::class, 'broadcastPage'])->name('admin.broadcast');
    Route::post('/admin/broadcast', [AdminController::class, 'sendBroadcast'])->name('admin.broadcast.send');
    
    Route::get('/admin/stock-opname', [AdminController::class, 'stockOpname'])->name('admin.stock-opname');
    Route::post('/admin/stock-opname', [AdminController::class, 'bulkInsertAssets'])->name('admin.stock-opname.store');
    
    Route::get('/admin/transactions', [AdminController::class, 'transactions'])->name('admin.transactions');
    Route::get('/admin/transactions/export', [AdminController::class, 'exportTransactions'])->name('admin.transactions.export');
    Route::post('/admin/transactions/bulk-delete', [AdminController::class, 'bulkDeleteTransactions'])->name('admin.transactions.bulk-delete');

    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::post('/admin/users/{user}/balance', [AdminController::class, 'adjustBalance'])->name('admin.users.balance');

    Route::get('/admin/vouchers', [AdminController::class, 'vouchers'])->name('admin.vouchers');
    Route::post('/admin/vouchers', [AdminController::class, 'storeVoucher'])->name('admin.vouchers.store');
    Route::delete('/admin/vouchers/{voucher}', [AdminController::class, 'destroyVoucher'])->name('admin.vouchers.destroy');

    Route::get('/admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('/admin/settings', [AdminController::class, 'updateSettings'])->name('admin.settings.update');

    Route::get('/admin/faqs', [AdminController::class, 'faqs'])->name('admin.faqs');
    Route::post('/admin/faqs', [AdminController::class, 'storeFaq'])->name('admin.faqs.store');
    Route::delete('/admin/faqs/{faq}', [AdminController::class, 'destroyFaq'])->name('admin.faqs.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
