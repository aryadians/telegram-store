<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\DigitalAsset;
use App\Models\Faq;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. SETTINGS & TEMPLATES SULTAN
        Setting::set('store_name', 'Zona Akun Premium');
        Setting::set('welcome_message', 'Platform otomatisasi Akun Premium nomor 1. Nikmati kemudahan transaksi instan dan garansi penuh 24/7.');
        Setting::set('admin_telegram', '@AdminStore');
        Setting::set('admin_whatsapp', '628123456789');
        Setting::set('referral_bonus', '10');
        Setting::set('admin_chat_id', '1239483429');

        // GUIDE TEMPLATE SULTAN
        Setting::set('template_guide', "╭────────────────────╮\n◆ 📌  <b>PANDUAN ORDER SULTAN</b>\n╰────────────────────╯\n\nSelamat datang! Mengikuti langkah di bawah ini akan mempercepat proses pesanan Anda:\n\nStep 1 ➜ Klik tombol 🛍️ <b>Mulai Belanja</b>\nStep 2 ➜ Pilih kategori dan paket produk\nStep 3 ➜ Pilih metode pembayaran (QRIS/Saldo)\nStep 4 ➜ Scan QRIS dan selesaikan dana\nStep 5 ➜ Data akun akan muncul <b>INSTAN</b> di chat ini!\n\n⏳ <b>PENTING:</b> QRIS berlaku selama 5 menit. Segera bayar agar sistem tidak membatalkan pesanan.\n\n❓ Butuh bantuan? Chat Admin: @AdminStore");

        // WARRANTY TEMPLATE SULTAN
        Setting::set('template_warranty', "╭──────────────────────╮\n◆ 🛡  <b>GARANSI & ATURAN PAKAI</b>\n╰──────────────────────╯\n\nKami menjamin kepuasan pelanggan dengan kebijakan berikut:\n\n1️⃣ <b>Garansi Penuh:</b> Selama masa langganan masih aktif.\n2️⃣ <b>Proses Klaim:</b> Kirimkan bukti error ke admin.\n3️⃣ <b>Aturan:</b> Dilarang keras mengubah password akun sharing.\n4️⃣ <b>Invoice:</b> Simpan nomor SnapID Anda sebagai bukti sah.\n\n꧁━━━━━━━━━━━━━━━━━━━━━━꧂\n⚠️ Pelanggaran aturan pakai dapat menghanguskan garansi Anda secara otomatis.\n\n✅ Admin standby 24 jam untuk membantu kendala Anda.");

        // SUCCESS TEMPLATE SULTAN
        Setting::set('template_success', "🎊 <b>HORE! PEMBAYARAN BERHASIL</b> 🎊\n━━━━━━━━━━━━━━━━━━━━\n🎉 Terima kasih telah mempercayakan kebutuhan premium Anda kepada kami. Berikut adalah detail pesanan Anda:\n\n📦 <b>Produk:</b> [PRODUCT_NAME]\n🔑 <b>DATA AKUN:</b>\n<code>[ACCOUNT_DETAILS]</code>\n\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Tips: Silakan copy data akun di atas dengan sekali klik. Jangan lupa berikan bintang 5 di menu Rapor ya!</i>\n\nEnjoy your premium life! ✨");

        // 2. CATEGORIES
        Category::truncate();
        $catStreaming = Category::create(['name' => '📺 Streaming Premium']);
        $catGames = Category::create(['name' => '🎮 Games & Top Up']);
        $catVpn = Category::create(['name' => '🛡️ VPN & Security']);

        // 3. PRODUCTS & STOCK
        Product::truncate();
        DigitalAsset::truncate();
        
        $p1 = Product::create(['category_id' => $catStreaming->id, 'name' => 'Netflix Premium 1 Bulan', 'code' => 'NFLX-1M', 'price' => 25000, 'is_active' => true]);
        for ($i = 1; $i <= 5; $i++) {
            DigitalAsset::create(['product_id' => $p1->id, 'data_detail' => "premium_user{$i}@gmail.com:pass_sultan{$i}"]);
        }

        Schema::enableForeignKeyConstraints();
    }
}
