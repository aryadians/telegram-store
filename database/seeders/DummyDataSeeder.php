<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\DigitalAsset;
use App\Models\Setting;
use App\Models\Faq;
use App\Models\Voucher;
use App\Models\BroadcastTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Truncate Tables
        Category::truncate();
        Product::truncate();
        DigitalAsset::truncate();
        Faq::truncate();
        Voucher::truncate();
        BroadcastTemplate::truncate();

        // 1. SETTINGS ZONA AKUN PREMIUM
        Setting::set('store_name', 'Zona Akun Premium');
        Setting::set('welcome_message', 'Pusat Akun FnB Premium Terpercaya. Nikmati Kopi Kenangan, Fore, hingga KFC dengan harga miring!');

        // 2. BROADCAST TEMPLATES SULTAN
        BroadcastTemplate::create([
            'title' => '☕️ Kopi Pagi Sultan',
            'message' => "✨ <b>BOOST PAGI KAMU DENGAN SECANGKIR KOPI!</b> ✨\n━━━━━━━━━━━━━━━━━━━━\n☕️ Mata masih ngantuk? Pekerjaan numpuk?\nTenang, <b>Zona Akun Premium</b> punya solusinya!\n\nDapatkan Akun <b>Fore Coffee</b> atau <b>Kopi Kenangan</b> dengan harga \"Sultan Irit\"!\n\n🚀 <b>PROSES INSTAN 24 JAM</b>\nKlik menu 🛍 <b>Katalog Produk</b> dan klaim kopi kamu sekarang!"
        ]);

        BroadcastTemplate::create([
            'title' => '🍗 Flash Sale Makan Siang',
            'message' => "⚡️ <b>FLASH SALE KILAT: PERUT KENYANG, DOMPET AMAN!</b> ⚡️\n━━━━━━━━━━━━━━━━━━━━\n🍔 Pengen <b>KFC</b> atau <b>McD</b> tapi lagi akhir bulan?\n\n🍗 <b>Paket Combo KFC</b> ➜ Potongan S/D 40%\n🍟 <b>McD Happy Points</b> ➜ Stok Terbatas!\n\n⏳ <b>SISA STOK:</b> < 10 Akun!\nKetik <code>/start</code> untuk serbu stoknya! 🏃💨"
        ]);

        BroadcastTemplate::create([
            'title' => '🍦 Weekend Vibes',
            'message' => "WEEKEND SULTAN: MANISNYA HIDUP TANPA MAHAL! 🍦\n━━━━━━━━━━━━━━━━━━━━\nLagi santai sama doi? Lengkapin momen manis kamu dengan voucher FnB terbaik!\n\n🌈 <b>MENU REKOMENDASI:</b>\n• <b>Janji Jiwa App</b> (Saldo)\n• <b>Tomoro Coffee</b> (B1G1)\n\n🎟 Gunakan Voucher: <code>MAKANPUAS</code>\n\n🌟 <b>BELANJA SEKARANG:</b>\nKlik tombol 🛍 <b>Order Produk</b>!"
        ]);

        BroadcastTemplate::create([
            'title' => '🏆 Referral Challenge',
            'message' => "🏆 <b>CHALLENGE: JADI RAJA REFERRAL!</b> 🏆\n━━━━━━━━━━━━━━━━━━━━\nMau saldo gratis tanpa deposit? Bisa banget! 💰\n\nAjak teman kamu gabung menggunakan link referral kamu:\n🔗 <code>https://t.me/zona_akun_premium_bot?start=REF_[ID]</code>\n\n🎁 <b>REWARD:</b>\nBonus saldo <b>Rp 5.000</b> setiap ada teman yang belanja pertama kali! 🤝✨"
        ]);

        BroadcastTemplate::create([
            'title' => '🆕 New Arrival Tomoro',
            'message' => "🆕 <b>NEW ARRIVAL: TOMORO COFFEE!</b> 🆕\n━━━━━━━━━━━━━━━━━━━━\nSesuai permintaan para Sultan, hari ini <b>Tomoro Coffee</b> resmi mendarat! 🥤✨\n\n✅ <b>Proses Otomatis</b>\n✅ <b>Garansi Anti-Zonk</b>\n\n🔥 <b>HARGA PERDANA:</b>\nMulai dari <b>Rp 15.000</b> saja! Langsung gas ke katalog sekarang! 🚀🛡"
        ]);

        // 3. CATEGORIES FnB
        $catCoffee = Category::create(['name' => '☕ Coffee Premium']);
        $catFood = Category::create(['name' => '🍔 Fast Food & Meals']);
        
        // 4. PRODUCTS
        $p1 = Product::create([
            'category_id' => $catCoffee->id,
            'name' => 'Kopi Kenangan - Voucher 50rb',
            'code' => 'KK-50',
            'price' => 25000,
            'cost_price' => 15000,
            'description' => 'Akun Kopi Kenangan dengan saldo 50rb.',
            'is_active' => true,
        ]);

        for ($i = 1; $i <= 10; $i++) {
            DigitalAsset::create(['product_id' => $p1->id, 'data_detail' => "user_kk_{$i}@gmail.com:pass{$i}"]);
        }

        Schema::enableForeignKeyConstraints();
    }
}
