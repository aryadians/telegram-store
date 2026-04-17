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
use App\Models\Rating;
use App\Models\RestockNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TelegramController extends Controller
{
    protected $token;
    protected $apiUrl;

    public function __construct() { $this->token = env('TELEGRAM_BOT_TOKEN'); $this->apiUrl = "https://api.telegram.org/bot{$this->token}"; }

    public function webhook(Request $request)
    {
        $update = $request->all();
        if (isset($update['message'])) {
            $chatId = $update['message']['chat']['id'];
            
            // 1. MAINTENANCE MODE CHECK
            $isMaintenance = Setting::get('maintenance_mode', '0');
            if ($isMaintenance === '1' && $chatId != Setting::get('admin_chat_id')) {
                $this->sendMessage($chatId, "🚧 <b>MAINTENANCE MODE</b>\n\nMaaf bos, toko sedang libur sebentar untuk restock besar-besaran! Silakan cek kembali nanti ya.");
                return response()->json(['status' => 'maintenance']);
            }

            if (Cache::has('spam_'.$chatId)) return response()->json(['status' => 'limit']);
            Cache::put('spam_'.$chatId, true, 1);

            $text = $update['message']['text'] ?? '';
            $from = $update['message']['from'];
            $user = TelegramUser::updateOrCreate(['chat_id' => $chatId], ['username' => $from['username'] ?? null, 'first_name' => $from['first_name'] ?? null]);

            switch (true) {
                case str_starts_with($text, '/start'): $this->sendWelcome($chatId); break;
                case $text === '🛍️ Order Produk': $this->sendCategories($chatId); break;
                case $text === '🏆 Leaderboard': $this->sendLeaderboard($chatId); break;
                case $text === '👤 Profil': $this->sendProfile($chatId); break;
                case $text === '💰 Deposit': $this->promptDeposit($chatId); break;
                case str_starts_with($text, '/claim '): $this->applyVoucher($chatId, str_replace('/claim ', '', $text)); break;
                default: if (!str_starts_with($text, '/')) $this->executeSearch($chatId, $text); break;
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
        if ($data === 'action_order') $this->sendCategories($chatId);
        elseif ($data === 'START_CB') $this->sendWelcome($chatId);
        elseif (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
        elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
        elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
        
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function sendWelcome($chatId)
    {
        $text = "✨ <b>EMPIRE CONSOLE</b> ✨\n\nSelamat datang di pusat aset digital premium. Pilih menu di bawah:";
        $btns = [
            [['text' => '🛍️ Order Produk', 'callback_data' => 'action_order'], ['text' => '🏆 Leaderboard', 'callback_data' => 'action_stats']],
            [['text' => '👤 Profil', 'callback_data' => 'action_profile'], ['text' => '💰 Deposit', 'callback_data' => 'action_deposit']]
        ];
        
        $banner = Setting::get('bot_banner_url');
        if ($banner) $this->sendPhoto($chatId, $banner, $text, ['inline_keyboard' => $btns]);
        else $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }

    protected function confirmPurchase($chatId, $productId)
    {
        $product = Product::find($productId);
        if (!$product) return;

        $text = "🎯 <b>PRODUK DETAIL</b>\n━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📦 <b>Produk:</b> {$product->name}\n";
        $text .= "💰 <b>Harga:</b> Rp " . number_format($product->price) . "\n";
        $text .= "📝 <b>Info:</b> " . ($product->description ?: 'Instan & Bergaransi') . "\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n\nSilakan klik tombol di bawah untuk bayar:";

        $buttons = [
            [['text' => '📸 Bayar QRIS (Otomatis)', 'callback_data' => "PAY_QRIS_{$product->id}"]],
            [['text' => '⬅️ Batal', 'callback_data' => 'START_CB']]
        ];

        if ($product->image_url) {
            $this->sendPhoto($chatId, $product->image_url, $text, ['inline_keyboard' => $buttons]);
        } else {
            $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
        }
    }

    // (Remaining helpers stay safe...)
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
