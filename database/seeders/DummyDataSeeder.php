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

        // 1. SETTINGS & TEMPLATES
        Setting::set('store_name', 'Zona Akun Premium');
        Setting::set('welcome_message', 'Solusi instan kebutuhan digital Anda. Transaksi 24/7 otomatis.');
        Setting::set('admin_telegram', '@AdminStore');
        Setting::set('admin_whatsapp', '628123456789');
        Setting::set('referral_bonus', '10');
        Setting::set('admin_chat_id', '1239483429');

        // GUIDE TEMPLATE
        Setting::set('template_guide', "╭────────────────────╮\n◆ 📌  PANDUAN ORDER\n╰────────────────────╯\n\nStep 1 ➜ Klik 🛍️ Mulai Belanja\nStep 2 ➜ Pilih produk yang kamu mau\nStep 3 ➜ Tentukan jumlah\nStep 4 ➜ Scan QRIS & bayar\nStep 5 ➜ Klik ✅ Saya Sudah Bayar\n\n⏳ QR berlaku ±5 menit.\n\n⚠️ Pembayaran setelah QR kadaluarsa dilakukan atas risiko pembeli. Jika transaksi berhasil tetapi produk tidak terkirim, hubungi admin.\n\n❓ Butuh bantuan? Klik Hubungi Admin.");

        // WARRANTY TEMPLATE
        Setting::set('template_warranty', "╭──────────────────────╮\n◆ 🛡  GARANSI & ATURAN\n╰──────────────────────╯\n\n1. Simpan bukti pembayaran & invoice (SnapID).\n2. QRIS berlaku ±5 menit.\n3. Jika status Success tapi barang belum terkirim, klik ✅ Saya Sudah Bayar.\n4. Masih belum terkirim? Hubungi admin dengan SnapID + waktu transaksi.\n\n꧁━━━━━━━━━━━━━━━━━━━━━━꧂\n⚠️ Pembayaran setelah QR kadaluarsa dilakukan atas risiko pembeli. Jika transaksi berhasil tetapi produk tidak terkirim, hubungi admin.\n\n✅ Kami berusaha memproses secepat mungkin agar ordermu aman & nyaman.");

        // SUCCESS TEMPLATE
        Setting::set('template_success', "🎊 <b>HORE! PEMBAYARAN BERHASIL</b> 🎊\n━━━━━━━━━━━━━━━━━━━━\n📦 <b>Produk:</b> [PRODUCT_NAME]\n🔑 <b>Data Akun:</b>\n<code>[ACCOUNT_DETAILS]</code>\n━━━━━━━━━━━━━━━━━━━━\nTerima kasih telah berlangganan di <b>Zona Akun Premium</b>! Jika ada kendala, hubungi menu Bantuan.");

        // 2. CATEGORIES
        Category::truncate();
        $catStreaming = Category::create(['name' => '📺 Streaming']);
        $catGames = Category::create(['name' => '🎮 Games & Top Up']);

        // 3. PRODUCTS & STOCK
        Product::truncate();
        DigitalAsset::truncate();
        
        $p1 = Product::create(['category_id' => $catStreaming->id, 'name' => 'Netflix Premium 1 Month', 'code' => 'NFLX-1M', 'price' => 25000, 'is_active' => true]);
        for ($i = 1; $i <= 5; $i++) {
            DigitalAsset::create(['product_id' => $p1->id, 'data_detail' => "netflix_user{$i}@mail.com:pass{$i}123"]);
        }

        // 4. FAQS
        Faq::truncate();
        Faq::create(['question' => 'Apakah akun bergaransi?', 'answer' => 'Ya, garansi penuh sesuai masa aktif produk.']);

        Schema::enableForeignKeyConstraints();
    }
}
