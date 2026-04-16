<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
use App\Models\Voucher;
use App\Models\Setting;
use App\Models\Deposit;
use App\Models\DigitalAsset;
use App\Models\Favorite;
use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramController extends Controller
{
    protected $token;
    protected $apiUrl;

    public function __construct()
    {
        $this->token = env('TELEGRAM_BOT_TOKEN');
        $this->apiUrl = "https://api.telegram.org/bot{$this->token}";
    }

    public function webhook(Request $request)
    {
        $update = $request->all();
        if (isset($update['message'])) {
            $chatId = $update['message']['chat']['id'];
            $text = $update['message']['text'] ?? '';
            $from = $update['message']['from'];

            TelegramUser::updateOrCreate(['chat_id' => $chatId], [
                'username' => $from['username'] ?? null, 
                'first_name' => $from['first_name'] ?? null
            ]);

            switch (true) {
                case str_starts_with($text, '/start'): $this->sendWelcome($chatId); break;
                case $text === '🛍️ Order Produk': $this->sendCategories($chatId); break;
                case $text === '💳 Cek Pembayaran': $this->sendStatus($chatId); break;
                case $text === '🔍 Cari Produk': $this->promptSearch($chatId); break;
                case $text === '⭐ Favorit': $this->sendFavorites($chatId); break;
                case $text === '👤 Profil': $this->sendProfile($chatId); break;
                case $text === '📊 Rapor': $this->sendStats($chatId); break;
                case $text === '💰 Deposit': $this->promptDeposit($chatId); break;
                case $text === '📜 Riwayat Transaksi': $this->sendHistory($chatId); break;
                case $text === '🔄 Order Lagi': $this->sendHistory($chatId, true); break;
                case $text === '📋 Panduan Order': $this->sendGuide($chatId); break;
                case $text === '🛡️ Garansi': $this->sendWarranty($chatId); break;
                case $text === '❓ FAQ': $this->sendFaqs($chatId); break;
                case $text === '🆘 Bantuan': $this->sendHelp($chatId); break;
                case $text === '📡 Live Center': $this->sendLiveCenter($chatId); break;
                case $text === '💬 WA Admin': $this->sendWaLink($chatId); break;
                case $text === '🔔 Notif Restock': $this->sendRestockMenu($chatId); break;
                default: 
                    if (!str_starts_with($text, '/')) $this->executeSearch($chatId, $text);
                    break;
            }
        } elseif (isset($update['callback_query'])) {
            $chatId = $update['callback_query']['message']['chat']['id'];
            $data = $update['callback_query']['data'];
            $this->handleCallback($chatId, $data, $update['callback_query']);
        }
        return response()->json(['status' => 'ok']);
    }

    protected function handleCallback($chatId, $data, $query)
    {
        switch ($data) {
            case 'action_order': $this->sendCategories($chatId); break;
            case 'action_check': $this->sendStatus($chatId); break;
            case 'action_search': $this->promptSearch($chatId); break;
            case 'action_fav': $this->sendFavorites($chatId); break;
            case 'action_profile': $this->sendProfile($chatId); break;
            case 'action_stats': $this->sendStats($chatId); break;
            case 'action_deposit': $this->promptDeposit($chatId); break;
            case 'action_history': $this->sendHistory($chatId); break;
            case 'action_reorder': $this->sendHistory($chatId, true); break;
            case 'action_guide': $this->sendGuide($chatId); break;
            case 'action_warranty': $this->sendWarranty($chatId); break;
            case 'action_faq': $this->sendFaqs($chatId); break;
            case 'action_help': $this->sendHelp($chatId); break;
            case 'action_live': $this->sendLiveCenter($chatId); break;
            case 'action_wa': $this->sendWaLink($chatId); break;
            case 'action_restock': $this->sendRestockMenu($chatId); break;
            case 'START_CB': $this->sendWelcome($chatId); break;
            case 'SHOW_CATEGORIES': $this->sendCategories($chatId); break;
            case 'CAT_ALL': $this->sendProductsByCategory($chatId, 'ALL'); break;
            default:
                if (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
                elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
                elseif (str_starts_with($data, 'FAV_')) $this->toggleFavorite($chatId, str_replace('FAV_', '', $data));
                elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
                elseif (str_starts_with($data, 'PAY_BAL_')) $this->payWithBalance($chatId, str_replace('PAY_BAL_', '', $data));
                elseif (str_starts_with($data, 'DEP_')) $this->processDeposit($chatId, str_replace('DEP_', '', $data));
                break;
        }
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function sendWelcome($chatId)
    {
        $storeName = Setting::get('store_name', 'Zona Akun Premium');
        $welcomeMsg = Setting::get('welcome_message', "Solusi otomatis untuk kebutuhan Akun Premium & Digital Assets Anda.");

        $text = "✨ <b>" . strtoupper($storeName) . "</b> ✨\n\n";
        $text .= "Selamat datang di platform otomatisasi akun premium terbaik. Nikmati layanan 24/7 dengan proses instan.\n\n";
        $text .= "📝 <b>Pesan Admin:</b>\n<i>\"{$welcomeMsg}\"</i>\n\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📱 <b>NAVIGASI UTAMA</b>\n";
        $text .= "Pilih menu di bawah untuk memulai:";

        $buttons = [
            [['text' => '🛍️ Order Produk', 'callback_data' => 'action_order'], ['text' => '💳 Cek Pembayaran', 'callback_data' => 'action_check']],
            [['text' => '🔍 Cari Produk', 'callback_data' => 'action_search'], ['text' => '⭐ Favorit', 'callback_data' => 'action_fav']],
            [['text' => '👤 Profil', 'callback_data' => 'action_profile'], ['text' => '📊 Rapor', 'callback_data' => 'action_stats'], ['text' => '💰 Deposit', 'callback_data' => 'action_deposit']],
            [['text' => '📜 Riwayat Transaksi', 'callback_data' => 'action_history'], ['text' => '🔄 Order Lagi', 'callback_data' => 'action_reorder']],
            [['text' => '📋 Panduan Order', 'callback_data' => 'action_guide'], ['text' => '🛡️ Garansi', 'callback_data' => 'action_warranty'], ['text' => '❓ FAQ', 'callback_data' => 'action_faq']],
            [['text' => '🆘 Bantuan', 'callback_data' => 'action_help'], ['text' => '📡 Live Center', 'callback_data' => 'action_live']],
            [['text' => '💬 WA Admin', 'callback_data' => 'action_wa'], ['text' => '🔔 Notif Restock', 'callback_data' => 'action_restock']]
        ];

        $replyMarkup = ['inline_keyboard' => $buttons];
        $bannerUrl = Setting::get('bot_banner_url');
        
        if ($bannerUrl) {
            $this->sendPhoto($chatId, $bannerUrl, $text, $replyMarkup);
        } else {
            $this->sendMessage($chatId, $text, $replyMarkup);
        }
    }

    protected function sendCategories($chatId)
    {
        $categories = Category::all();
        $text = "🗂️ <b>ETALASE KATEGORI</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "Silakan pilih kategori produk yang Anda butuhkan. Setiap kategori berisi berbagai paket premium dengan harga bersaing.";
        
        $buttons = [];
        foreach ($categories as $cat) {
            $buttons[] = [['text' => "📁 {$cat->name}", 'callback_data' => "CAT_{$cat->id}"]];
        }
        $buttons[] = [['text' => "🌐 Tampilkan Semua Produk", 'callback_data' => "CAT_ALL"]];
        $buttons[] = [['text' => "⬅️ Kembali ke Menu Utama", 'callback_data' => 'START_CB']];
        
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function sendProductsByCategory($chatId, $catId)
    {
        $query = Product::where('is_active', true);
        if ($catId !== 'ALL') {
            $cat = Category::find($catId);
            $query->where('category_id', $catId);
            $header = "📁 <b>KATEGORI: " . strtoupper($cat->name ?? 'SEMUA') . "</b>";
        } else {
            $header = "🌐 <b>SEMUA PRODUK TERSEDIA</b>";
        }

        $products = $query->get();
        $text = "{$header}\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "Klik pada produk pilihan Anda untuk melihat detail dan melakukan pembayaran.\n\n";
        $text .= "💡 <i>Tips: Harga sudah termasuk garansi penuh.</i>";

        $buttons = [];
        foreach ($products as $p) {
            $stock = $p->availableAssetsCount();
            if ($stock > 0) {
                $buttons[] = [['text' => "🔹 {$p->name} • Rp " . number_format($p->price) . " (S: {$stock})", 'callback_data' => "BUY_{$p->id}"]];
            }
        }

        if (empty($buttons)) {
            $this->sendMessage($chatId, "⚠️ <b>MAAF</b>\nStok untuk kategori ini sedang kosong. Admin akan segera melakukan restock!");
            return;
        }

        $buttons[] = [['text' => "⬅️ Kembali ke Kategori", 'callback_data' => 'SHOW_CATEGORIES']];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function confirmPurchase($chatId, $productId)
    {
        $product = Product::find($productId);
        if (!$product) return;
        
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $isFav = Favorite::where('chat_id', $chatId)->where('product_id', $productId)->exists();

        $text = "🎯 <b>KONFIRMASI PEMESANAN</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📦 <b>Produk:</b> {$product->name}\n";
        $text .= "💰 <b>Harga:</b> <code>Rp " . number_format($product->price) . "</code>\n";
        $text .= "📦 <b>Status:</b> Ready Stock ✅\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $text .= "Silakan pilih metode pembayaran yang paling nyaman bagi Anda. Akun akan dikirim otomatis setelah sistem mendeteksi dana masuk.";

        $buttons = [];
        if ($user->balance >= $product->price) {
            $buttons[] = [['text' => "💳 Bayar via Saldo (Sisa: Rp " . number_format($user->balance) . ")", 'callback_data' => "PAY_BAL_{$product->id}"]];
        } else {
            $buttons[] = [['text' => "❌ Saldo Kurang (Isi Saldo Dulu)", 'callback_data' => "action_deposit"]];
        }
        
        $buttons[] = [['text' => "📸 Bayar QRIS (Instan & Otomatis)", 'callback_data' => "PAY_QRIS_{$product->id}"]];
        $buttons[] = [
            ['text' => $isFav ? '❤️ Hapus Favorit' : '⭐ Favoritkan', 'callback_data' => "FAV_{$product->id}"],
            ['text' => '⬅️ Batal', 'callback_data' => 'SHOW_CATEGORIES']
        ];

        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function sendProfile($chatId)
    {
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $totalOrders = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->count();
        
        $text = "👤 <b>PROFIL PELANGGAN</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📛 <b>Nama:</b> {$user->first_name}\n";
        $text .= "🆔 <b>Chat ID:</b> <code>{$chatId}</code>\n";
        $text .= "💰 <b>Saldo:</b> <code>Rp " . number_format($user->balance) . "</code>\n";
        $text .= "🛒 <b>Total Order:</b> {$totalOrders} Sukses\n";
        $text .= "🔗 <b>Referral:</b> <code>{$user->referral_code}</code>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $text .= "🎁 <b>Undang Teman & Dapat Komisi!</b>\n";
        $text .= "Setiap teman yang daftar dan belanja, Anda dapat bonus saldo!\n";
        $text .= "<code>https://t.me/zona_akun_premium_bot?start=REF_{$chatId}</code>";

        $buttons = [[['text' => '💳 Isi Saldo (Top Up)', 'callback_data' => 'action_deposit'], ['text' => '⬅️ Menu Utama', 'callback_data' => 'START_CB']]];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function sendHistory($chatId, $orderAgain = false)
    {
        $txs = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->with(['product', 'digitalAsset'])->latest()->take(5)->get();
        
        if ($txs->isEmpty()) {
            $this->sendMessage($chatId, "📜 <b>RIWAYAT KOSONG</b>\n\nAnda belum memiliki riwayat pembelian. Yuk mulai belanja!");
            return;
        }

        $text = $orderAgain ? "🔄 <b>ORDER ULANG CEPAT</b>\n" : "📜 <b>RIWAYAT TRANSAKSI TERAKHIR</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        
        $btns = [];
        foreach ($txs as $tx) {
            if (!$tx->product) continue;
            if ($orderAgain) {
                $btns[] = [['text' => "🛒 Beli Lagi: {$tx->product->name}", 'callback_data' => "BUY_{$tx->product_id}"]];
            } else {
                $text .= "📅 <b>" . $tx->created_at->format('d M Y H:i') . "</b>\n";
                $text .= "📦 <b>Produk:</b> {$tx->product->name}\n";
                $text .= "🔑 <b>Data:</b> <code>" . ($tx->digitalAsset->data_detail ?? 'Data Terhapus') . "</code>\n";
                $text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
            }
        }
        
        $btns[] = [['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }

    // --- SHARED UTILS ---
    protected function sendMessage($chatId, $text, $replyMarkup = null) {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendMessage", $payload)->json();
    }
    protected function sendPhoto($chatId, $photo, $caption, $replyMarkup = null) {
        $payload = ['chat_id' => $chatId, 'photo' => $photo, 'caption' => $caption, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendPhoto", $payload)->json();
    }
}
