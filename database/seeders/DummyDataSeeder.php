<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\DigitalAsset;
use App\Models\Setting;
use App\Models\Faq;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Truncate Old Data
        Category::truncate();
        Product::truncate();
        DigitalAsset::truncate();
        Faq::truncate();
        Voucher::truncate();

        // 1. SETTINGS SULTAN FnB
        Setting::set('store_name', 'FnB Account Sultan');
        Setting::set('welcome_message', 'Pusat Akun FnB Premium Terpercaya. Nikmati Kopi Kenangan, Fore, hingga KFC dengan harga miring!');

        // 2. CATEGORIES
        $catCoffee = Category::create(['name' => '☕ Coffee Premium']);
        $catFood = Category::create(['name' => '🍔 Fast Food & Meals']);
        $catDessert = Category::create(['name' => '🍦 Dessert & Snacks']);

        // 3. PRODUCTS & MASSIVE DUMMY ASSETS
        $fnbProducts = [
            [
                'cat' => $catCoffee->id,
                'name' => 'Kopi Kenangan - Voucher 50rb',
                'code' => 'KK-50',
                'price' => 25000,
                'cost' => 15000,
                'desc' => 'Akun Kopi Kenangan dengan saldo voucher 50rb. Siap pakai!'
            ],
            [
                'cat' => $catCoffee->id,
                'name' => 'Tomoro Coffee - Akun Promo',
                'code' => 'TM-PROMO',
                'price' => 15000,
                'cost' => 8000,
                'desc' => 'Akun Tomoro Coffee dengan 3 voucher buy 1 get 1.'
            ],
            [
                'cat' => $catCoffee->id,
                'name' => 'Fore Coffee - Points 100k',
                'code' => 'FR-100',
                'price' => 45000,
                'cost' => 30000,
                'desc' => 'Akun Fore Coffee berisi 100.000 points. Bisa tukar 3-4 cup kopi!'
            ],
            [
                'cat' => $catCoffee->id,
                'name' => 'Janji Jiwa - Saldo App',
                'code' => 'JJ-SALDO',
                'price' => 20000,
                'cost' => 12000,
                'desc' => 'Akun Jiwa+ dengan saldo mengendap. Hemat 50%!'
            ],
            [
                'cat' => $catFood->id,
                'name' => 'KFC - Voucher Combo',
                'code' => 'KFC-COMBO',
                'price' => 35000,
                'cost' => 25000,
                'desc' => 'Akun KFC berisi voucher paket combo ayam + nasi.'
            ],
            [
                'cat' => $catFood->id,
                'name' => 'McDonalds - Happy Points',
                'code' => 'MCD-PTS',
                'price' => 30000,
                'cost' => 20000,
                'desc' => 'Akun McD dengan reward points melimpah.'
            ],
        ];

        foreach ($fnbProducts as $item) {
            $p = Product::create([
                'category_id' => $item['cat'],
                'name' => $item['name'],
                'code' => $item['code'],
                'price' => $item['price'],
                'cost_price' => $item['cost'],
                'description' => $item['desc'],
                'is_active' => true,
            ]);

            // GENERATE 20 DUMMY ASSETS PER PRODUCT
            for ($i = 1; $i <= 20; $i++) {
                DigitalAsset::create([
                    'product_id' => $p->id,
                    'data_detail' => "user_fnb_{$item['code']}_{$i}@gmail.com:pass_sultan{$i} | AuthToken: " . bin2hex(random_bytes(10))
                ]);
            }
        }

        // 4. FAQS
        Faq::create(['question' => 'Apakah akun aman?', 'answer' => 'Sangat aman dan bergaransi selama voucher belum digunakan.']);
        Faq::create(['question' => 'Cara pakai gimana?', 'answer' => 'Login ke aplikasi masing-masing FnB menggunakan data yang kami kirimkan.']);

        // 5. VOUCHERS
        Voucher::create(['code' => 'MAKANPUAS', 'type' => 'fixed', 'value' => 5000, 'limit' => 100, 'is_active' => true]);

        Schema::enableForeignKeyConstraints();
    }
}
