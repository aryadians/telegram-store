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
use App\Models\RestockNotification;
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

            $user = TelegramUser::updateOrCreate(
                ['chat_id' => $chatId],
                ['username' => $from['username'] ?? null, 'first_name' => $from['first_name'] ?? null]
            );

            // Command & Menu Router
            switch (true) {
                case str_starts_with($text, '/start'): $this->sendWelcome($chatId); break;
                case $text === '🛍️ Order Produk' || $text === '/order': $this->sendCategories($chatId); break;
                case $text === '💳 Cek Pembayaran' || $text === '/check': $this->sendStatus($chatId); break;
                case $text === '📋 Panduan Order' || $text === '/guide': $this->sendGuide($chatId); break;
                case $text === '📜 Riwayat Transaksi' || $text === '/history': $this->sendHistory($chatId); break;
                case $text === '🔄 Order Lagi' || $text === '/reorder': $this->sendHistory($chatId, true); break;
                case $text === '🔍 Cari Produk' || $text === '/search': $this->promptSearch($chatId); break;
                case $text === '⭐ Favorit' || $text === '/favorites': $this->sendFavorites($chatId); break;
                case $text === '👤 Profil' || $text === '/profile': $this->sendProfile($chatId); break;
                case $text === '📊 Rapor' || $text === '/stats': $this->sendStats($chatId); break;
                case $text === '💰 Deposit' || $text === '/deposit': $this->promptDeposit($chatId); break;
                case $text === '📡 Live Center' || $text === '/live': $this->sendLiveCenter($chatId); break;
                case $text === '🆘 Bantuan' || $text === '/help': $this->sendHelp($chatId); break;
                case $text === '❓ FAQ' || $text === '/faq': $this->sendFaqs($chatId); break;
                case $text === '🔔 Notif Restock' || $text === '/restock': $this->sendRestockMenu($chatId); break;
                case $text === '🛡️ Garansi' || $text === '/warranty': $this->sendWarranty($chatId); break;
                case $text === '💬 WA Admin' || $text === '/admin': $this->sendWaLink($chatId); break;
                
                default: 
                    if (!str_starts_with($text, '/')) {
                        $this->executeSearch($chatId, $text);
                    }
                    break;
            }
        } elseif (isset($update['callback_query'])) {
            $chatId = $update['callback_query']['message']['chat']['id'];
            $data = $update['callback_query']['data'];

            if ($data === 'SHOW_CATEGORIES') $this->sendCategories($chatId);
            elseif ($data === 'START_CB') $this->sendWelcome($chatId);
            elseif ($data === 'CAT_ALL') $this->sendProductsByCategory($chatId, 'ALL');
            elseif (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
            elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
            elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
            elseif (str_starts_with($data, 'DEP_')) $this->processDeposit($chatId, str_replace('DEP_', '', $data));
        }

        return response()->json(['status' => 'ok']);
    }

    protected function sendWelcome($chatId)
    {
        $storeName = Setting::get('store_name', 'Zona Akun Premium');
        $welcomeMsg = Setting::get('welcome_message', "Solusi otomatis untuk kebutuhan Akun Premium & Digital Assets Anda.");

        $text = "✨ <b>" . strtoupper($storeName) . "</b> ✨\n\n";
        $text .= "{$welcomeMsg}\n\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📱 <b>Pilih Menu:</b>";

        $keyboard = [
            ['🛍️ Order Produk', '💳 Cek Pembayaran'],
            ['🔍 Cari Produk', '⭐ Favorit'],
            ['👤 Profil', '📊 Rapor', '💰 Deposit'],
            ['📜 Riwayat Transaksi', '🔄 Order Lagi'],
            ['📋 Panduan Order', '🛡️ Garansi', '❓ FAQ'],
            ['🆘 Bantuan', '📡 Live Center'],
            ['💬 WA Admin', '🔔 Notif Restock']
        ];

        $replyMarkup = [
            'keyboard' => $keyboard,
            'resize_keyboard' => true,
            'one_time_keyboard' => false
        ];

        $bannerUrl = Setting::get('bot_banner_url');
        if ($bannerUrl) {
            $this->sendPhoto($chatId, $bannerUrl, $text, $replyMarkup);
        } else {
            $this->sendMessage($chatId, $text, $replyMarkup);
        }
    }

    // --- FITUR REAL-TIME SYNC ---

    protected function sendCategories($chatId)
    {
        $categories = Category::all();
        $buttons = [];
        foreach ($categories as $cat) {
            $buttons[] = [['text' => "📁 {$cat->name}", 'callback_data' => "CAT_{$cat->id}"]];
        }
        $buttons[] = [['text' => "🌐 Semua Produk", 'callback_data' => "CAT_ALL"]];
        $buttons[] = [['text' => "🔍 Cari Produk", 'callback_data' => "SEARCH_CB"]];

        $this->sendMessage($chatId, "🗂️ <b>PILIH KATEGORI PRODUK</b>\n\nSilakan pilih kategori yang tersedia di bawah ini:", ['inline_keyboard' => $buttons]);
    }

    protected function executeSearch($chatId, $query)
    {
        $products = Product::where('is_active', true)->where('name', 'like', "%{$query}%")->get();
        if ($products->isEmpty()) {
            $this->sendMessage($chatId, "❌ Produk '<b>{$query}</b>' tidak ditemukan. Coba kata kunci lain.");
            return;
        }
        $buttons = [];
        foreach ($products as $p) {
            $stock = $p->availableAssetsCount();
            if ($stock > 0) {
                $buttons[] = [['text' => "🔹 {$p->name} • Rp " . number_format($p->price), 'callback_data' => "BUY_{$p->id}"]];
            }
        }
        $this->sendMessage($chatId, "🔍 <b>HASIL PENCARIAN '{$query}':</b>", ['inline_keyboard' => $buttons]);
    }

    protected function sendProfile($chatId)
    {
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $text = "👤 <b>PROFIL SULTAN</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📛 <b>Nama:</b> {$user->first_name}\n";
        $text .= "💰 <b>Saldo:</b> <code>Rp " . number_format($user->balance) . "</code>\n";
        $text .= "🔗 <b>Referral:</b> <code>{$user->referral_code}</code>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $text .= "🎁 <b>Link Referral:</b>\n<code>https://t.me/zona_akun_premium_bot?start=REF_{$user->chat_id}</code>";
        
        $this->sendMessage($chatId, $text);
    }

    protected function sendStats($chatId)
    {
        $totalPaid = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->sum('amount');
        $totalCount = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->count();
        
        $text = "📊 <b>RAPOR BELANJA</b>\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "💸 <b>Total Belanja:</b> <code>Rp " . number_format($totalPaid) . "</code>\n";
        $text .= "📦 <b>Total Akun:</b> <code>{$totalCount} Akun</code>\n";
        $text .= "🎖️ <b>Status:</b> " . ($totalPaid > 500000 ? "💎 VIP Member" : "⭐ Regular Member");
        
        $this->sendMessage($chatId, $text);
    }

    protected function promptDeposit($chatId)
    {
        $text = "💰 <b>ISI SALDO (TOP UP)</b>\n\nSilakan pilih nominal deposit Anda:";
        $buttons = [
            [['text' => 'Rp 10.000', 'callback_data' => 'DEP_10000'], ['text' => 'Rp 25.000', 'callback_data' => 'DEP_25000']],
            [['text' => 'Rp 50.000', 'callback_data' => 'DEP_50000'], ['text' => 'Rp 100.000', 'callback_data' => 'DEP_100000']],
        ];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    // Helper Methods
    protected function sendMessage($chatId, $text, $replyMarkup = null)
    {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendMessage", $payload)->json();
    }

    protected function sendPhoto($chatId, $photo, $caption, $replyMarkup = null)
    {
        $payload = ['chat_id' => $chatId, 'photo' => $photo, 'caption' => $caption, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendPhoto", $payload)->json();
    }
}
