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

        // 2. BROADCAST TEMPLATES SULTAN (EXTENDED)
        BroadcastTemplate::create([
            'title' => '☕️ Kopi Pagi Sultan (Long)',
            'message' => "✨ <b>BOOST PAGI KAMU DENGAN SECANGKIR KOPI SULTAN!</b> ✨\n━━━━━━━━━━━━━━━━━━━━\n☕️ Mata masih ngantuk? Pekerjaan numpuk? Atau lagi butuh inspirasi tapi dompet lagi tipis? Tenang, <b>Zona Akun Premium</b> punya solusinya untuk hari kamu!\n\nKenapa harus bayar harga normal kalau bisa dapet <b>DISKON S/D 50%</b> setiap hari? Kami menyediakan akun premium FnB siap pakai dengan saldo voucher yang melimpah!\n\n🌟 <b>PILIHAN TERBAIK PAGI INI:</b>\n• <b>Kopi Kenangan Voucher 50K</b> ➜ Cuma bayar Rp 25.000!\n• <b>Fore Points 100K (3-4 Cup)</b> ➜ Cuma bayar Rp 45.000!\n• <b>Tomoro Coffee Promo B1G1</b> ➜ Harga spesial hari ini!\n\n🚀 <b>KEUNGGULAN BELANJA DI SINI:</b>\n✅ Proses <b>INSTAN</b> (Bayar langsung dapet akun).\n✅ Akun <b>PRIVAT</b> & Aman (Bukan sharing sembarangan).\n✅ Support login aplikasi resmi.\n\nKlik menu 🛍 <b>Katalog Produk</b> di bawah dan klaim kopi kamu sekarang sebelum Admin kehabisan stok! Jangan biarkan pagi kamu berjalan tanpa kafein terbaik. 🔥"
        ]);

        BroadcastTemplate::create([
            'title' => '🍗 Flash Sale Makan Siang (Long)',
            'message' => "⚡️ <b>FLASH SALE KILAT: PERUT KENYANG, DOMPET TETAP AMAN!</b> ⚡️\n━━━━━━━━━━━━━━━━━━━━\n🍔 Pengen makan enak di <b>KFC</b> atau <b>McD</b> tapi lagi mode hemat akhir bulan? Jangan biarkan perutmu demo, Bosku! Saatnya makan mewah dengan harga rakyat jelata hanya di <b>Zona Akun Premium</b>.\n\nHari ini kami melakukan <b>MEGA RESTOCK</b> untuk menu fast food favorit kamu:\n\n🍗 <b>Paket Combo KFC (Ayam + Nasi + Minum)</b>\nHarga Normal: <s>Rp 55.000</s> ➜ <b>Harga Sultan: Rp 35.000!</b>\n\n🍟 <b>McD Happy Points / Voucher Ala Carte</b>\nHarga Normal: <s>Rp 40.000</s> ➜ <b>Harga Sultan: Rp 20.000!</b>\n\n⏳ <b>WARNING:</b> Sisa stok di sistem saat ini kurang dari 10 akun per kategori! Siapa cepat, dia dapat. Sistem kami bekerja otomatis 24 jam, jadi jangan sampai nunggu besok dan hanya melihat label ⚠️ <b>LIMIT</b>.\n\nKetik <code>/start</code> atau klik tombol di bawah untuk langsung serbu stoknya sekarang juga! 🏃💨"
        ]);

        BroadcastTemplate::create([
            'title' => '🍦 Weekend Vibes (Long)',
            'message' => "🍦 <b>WEEKEND SULTAN: MANISNYA HIDUP TANPA HARUS MAHAL!</b> 🍦\n━━━━━━━━━━━━━━━━━━━━\nLagi santai di mall sama doi? Atau lagi kumpul keluarga di rumah tapi pengen ngemil yang manis-manis? Lengkapin momen bahagia kamu dengan voucher FnB terbaik dari kami!\n\n🌈 <b>REKOMENDASI SNACK & DESSERT:</b>\n• <b>Janji Jiwa App (Saldo Mengendap)</b> ➜ Cocok buat nongkrong sore.\n• <b>Tomoro Coffee Account</b> ➜ Akun isi voucher Buy 1 Get 1 (Hemat banget!).\n• <b>Mixue / Dessert Box Voucher</b> ➜ Manisnya pas, harganya lebih pas!\n\n🎁 <b>BONUS KHUSUS WEEKEND:</b>\nGunakan Kode Voucher: <code>MAKANPUAS</code>\nDapatkan potongan harga tambahan <b>Rp 5.000</b> tanpa minimal belanja! Hanya berlaku sampai hari Minggu jam 23.59 WIB.\n\n🌟 <b>CARA BELANJA:</b>\n1. Klik tombol 🛍 <b>Order Produk</b>.\n2. Pilih kategori 🍦 <b>Dessert & Snacks</b>.\n3. Masukkan kode voucher di menu konfirmasi.\n\nEnjoy your weekend like a real Sultan! ✨"
        ]);

        BroadcastTemplate::create([
            'title' => '🏆 Referral Challenge (Long)',
            'message' => "🏆 <b>REFERRAL CHALLENGE: JADI RAJA REFERRAL & DAPAT SALDO GRATIS!</b> 🏆\n━━━━━━━━━━━━━━━━━━━━\nMau saldo gratis tanpa perlu deposit sama sekali? Di <b>Zona Akun Premium</b>, itu sangat mungkin terjadi! 💰✨\n\nKami sedang mencari <b>Raja Referral</b> minggu ini. Cukup ajak circle atau teman-teman kamu untuk gabung dan belanja di bot ini menggunakan link unik kamu.\n\n🔗 <b>LINK REFERRAL KAMU:</b>\n<code>https://t.me/zona_akun_premium_bot?start=REF_[ID]</code>\n\n🎁 <b>REWARD YANG BISA KAMU DAPAT:</b>\n✅ Bonus Saldo <b>Rp 5.000</b> Langsung setiap ada teman yang belanja pertama kali.\n✅ Komisi <b>10%</b> dari setiap deposit saldo yang dilakukan teman kamu selamanya!\n\n💡 <b>PRO TIP:</b>\nShare link di atas ke grup WhatsApp, Telegram, atau Twitter kamu dengan caption menarik. Semakin banyak yang klik, semakin tebal wallet kamu! 💸\n\n📊 Cek posisi peringkat kamu di menu 🏆 <b>Papan Peringkat</b>. Ayo mulai sebar linknya dan jadilah Sultan sejati tanpa modal! 🤝✨"
        ]);

        BroadcastTemplate::create([
            'title' => '🆕 New Arrival Tomoro (Long)',
            'message' => "🆕 <b>NEW ARRIVAL: TOMORO COFFEE RESMI MENDARAT!</b> 🆕\n━━━━━━━━━━━━━━━━━━━━\nSesuai permintaan ribuan Sultan pelanggan setia kami, hari ini <b>Tomoro Coffee</b> resmi masuk ke dalam jajaran katalog premium <b>Zona Akun Premium</b>! 🥤✨\n\nNikmati sensasi kopi premium yang sedang viral ini dengan harga yang jauh lebih terjangkau. Kenapa harus beli akun Tomoro di sini?\n\n✅ <b>Full Otomatis:</b> Bayar ➜ Deteksi Sistem ➜ Data Akun Muncul Instan.\n✅ <b>Garansi Anti-Zonk:</b> Jika voucher tidak bisa diklaim, ganti akun baru atau saldo kembali!\n✅ <b>User Friendly:</b> Data yang dikirim sudah termasuk instruksi login yang sangat mudah dipahami bahkan untuk pemula.\n\n🔥 <b>HARGA PERDANA (STOK TERBATAS):</b>\nAkun Promo Tomoro (Isi 3 Voucher B1G1) mulai dari <b>Rp 15.000</b> saja! Hemat lebih dari Rp 40.000 dibandingkan beli langsung di gerai.\n\nTunggu apalagi? Gerai Tomoro di kota kamu sudah menunggu. Langsung gas ke katalog sekarang sebelum disikat habis pembeli lain! 🚀🛡"
        ]);

        // 3. CATEGORIES & PRODUCTS (RESTORATION)
        $catCoffee = Category::create(['name' => '☕ Coffee Premium']);
        $p1 = Product::create([
            'category_id' => $catCoffee->id,
            'name' => 'Kopi Kenangan - Voucher 50rb',
            'code' => 'KK-50',
            'price' => 25000,
            'cost_price' => 15000,
            'description' => 'Akun Kopi Kenangan dengan saldo voucher 50rb.',
            'is_active' => true,
        ]);

        for ($i = 1; $i <= 5; $i++) {
            DigitalAsset::create(['product_id' => $p1->id, 'data_detail' => "user_kk_{$i}@gmail.com:pass{$i}"]);
        }

        Schema::enableForeignKeyConstraints();
    }
}
