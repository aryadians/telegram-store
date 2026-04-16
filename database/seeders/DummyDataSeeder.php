<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\DigitalAsset;
use App\Models\TelegramUser;
use App\Models\Faq;
use App\Models\Setting;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. SETTINGS
        Setting::set('store_name', 'Zona Akun Premium');
        Setting::set('welcome_message', 'Solusi instan kebutuhan digital Anda. Transaksi 24/7 otomatis.');
        Setting::set('admin_telegram', '@AdminStore');
        Setting::set('admin_whatsapp', '628123456789');
        Setting::set('referral_bonus', '10');

        // 2. CATEGORIES
        $catStreaming = Category::create(['name' => '📺 Streaming']);
        $catGames = Category::create(['name' => '🎮 Games & Top Up']);
        $catVpn = Category::create(['name' => '🛡️ VPN & Privacy']);

        // 3. PRODUCTS & STOCK
        // Netflix
        $p1 = Product::create([
            'category_id' => $catStreaming->id,
            'name' => 'Netflix Premium 1 Month',
            'code' => 'NFLX-1M',
            'price' => 25000,
            'is_active' => true
        ]);
        for ($i = 1; $i <= 10; $i++) {
            DigitalAsset::create(['product_id' => $p1->id, 'data_detail' => "netflix_user{$i}@mail.com:pass{$i}123"]);
        }

        // Spotify
        $p2 = Product::create([
            'category_id' => $catStreaming->id,
            'name' => 'Spotify Individual 3 Month',
            'code' => 'SPOT-3M',
            'price' => 15000,
            'is_active' => true
        ]);
        for ($i = 1; $i <= 5; $i++) {
            DigitalAsset::create(['product_id' => $p2->id, 'data_detail' => "spotify_user{$i}@mail.com:music{$i}pass"]);
        }

        // Mobile Legends
        $p3 = Product::create([
            'category_id' => $catGames->id,
            'name' => 'MLBB 86 Diamonds',
            'code' => 'ML-86',
            'price' => 20000,
            'is_active' => true
        ]);
        for ($i = 1; $i <= 3; $i++) { // Low stock example
            DigitalAsset::create(['product_id' => $p3->id, 'data_detail' => "MLBB-REDEEM-CODE-00{$i}X"]);
        }

        // NordVPN
        $p4 = Product::create([
            'category_id' => $catVpn->id,
            'name' => 'NordVPN 1 Year Private',
            'code' => 'NORD-1Y',
            'price' => 45000,
            'is_active' => true
        ]);
        for ($i = 1; $i <= 8; $i++) {
            DigitalAsset::create(['product_id' => $p4->id, 'data_detail' => "nord_user{$i}@secure.com:privacy{$i}789"]);
        }

        // 4. CUSTOMERS (DUMMY TELEGRAM USERS)
        TelegramUser::create([
            'chat_id' => '123456789',
            'username' => 'customer_sultan',
            'first_name' => 'Budi Sultan',
            'balance' => 150000,
            'referral_code' => 'BUDI69'
        ]);

        TelegramUser::create([
            'chat_id' => '987654321',
            'username' => 'ani_premium',
            'first_name' => 'Ani Wijaya',
            'balance' => 5000,
            'referral_code' => 'ANI123',
            'referred_by' => '123456789'
        ]);

        // 5. VOUCHERS
        Voucher::create([
            'code' => 'SULTANIRIT',
            'type' => 'percent',
            'value' => 10,
            'limit' => 100,
            'used' => 5
        ]);

        Voucher::create([
            'code' => 'CASHBACK5K',
            'type' => 'fixed',
            'value' => 5000,
            'limit' => 50,
            'used' => 10
        ]);

        // 6. FAQS
        Faq::create([
            'question' => 'Apakah akun bergaransi?',
            'answer' => 'Ya, semua produk kami bergaransi penuh selama masa langganan aktif. Silakan hubungi admin jika ada kendala login.'
        ]);
        Faq::create([
            'question' => 'Bagaimana cara bayar?',
            'answer' => 'Anda bisa bayar melalui QRIS (Gopay, Dana, OVO, LinkAja) atau menggunakan Saldo Bot yang bisa Anda isi melalui menu Deposit.'
        ]);
    }
}
