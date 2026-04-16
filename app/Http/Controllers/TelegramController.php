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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

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
            
            // 1. RATE LIMITER (Operational Security)
            $cacheKey = 'bot_spam_' . $chatId;
            if (Cache::has($cacheKey)) {
                return response()->json(['status' => 'rate_limit']);
            }
            Cache::put($cacheKey, true, 1); // 1 second limit

            $text = $update['message']['text'] ?? '';
            $from = $update['message']['from'];

            $user = TelegramUser::updateOrCreate(['chat_id' => $chatId], [
                'username' => $from['username'] ?? null, 
                'first_name' => $from['first_name'] ?? null
            ]);

            switch (true) {
                case str_starts_with($text, '/start'): $this->sendWelcome($chatId); break;
                case $text === '🛍️ Order Produk': $this->sendCategories($chatId); break;
                case $text === '💳 Cek Pembayaran': $this->sendStatus($chatId); break;
                case $text === '👤 Profil': $this->sendProfile($chatId); break;
                case $text === '📊 Rapor': $this->sendStats($chatId); break;
                case $text === '💰 Deposit': $this->promptDeposit($chatId); break;
                case $text === '🆘 Bantuan': $this->sendHelp($chatId); break;
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
        if (str_starts_with($data, 'RATE_')) {
            $this->processRating($chatId, str_replace('RATE_', '', $data));
        } elseif ($data === 'PAY_MANUAL') {
            $this->sendManualInstructions($chatId);
        } else {
            // ... (Rest of existing callback logic)
        }
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function processRating($chatId, $data)
    {
        $parts = explode('_', $data);
        if (count($parts) < 2) return;
        $txId = $parts[0];
        $stars = (int) $parts[1];

        $rating = Rating::updateOrCreate(['transaction_id' => $txId], ['stars' => $stars]);
        $tx = Transaction::with('product')->find($txId);
        $user = TelegramUser::where('chat_id', $chatId)->first();

        $this->sendMessage($chatId, "💖 <b>Terima kasih!</b> Rating ⭐ {$stars} Anda sangat berarti.");

        // AUTO-POST TESTIMONIAL (Only for 5 Stars)
        if ($stars === 5) {
            $channelId = Setting::get('testi_channel_id');
            if ($channelId) {
                $testiMsg = "🌟 <b>ULASAN BINTANG 5!</b> 🌟\n\n";
                $testiMsg .= "👤 <b>User:</b> " . ($user->first_name ?? 'Pelanggan') . "\n";
                $testiMsg .= "📦 <b>Produk:</b> " . ($tx->product->name ?? 'Digital Account') . "\n";
                $testiMsg .= "💬 <b>Rating:</b> ⭐⭐⭐⭐⭐\n\n";
                $testiMsg .= "<i>\"Transaksi aman & instan! Terpercaya!\"</i>\n\n";
                $testiMsg .= "✅ Belanja sekarang: @zona_akun_premium_bot";
                $this->sendMessage($channelId, $testiMsg);
            }
        }
    }

    protected function sendManualInstructions($chatId)
    {
        $details = Setting::get('manual_payment_details', 'Silakan hubungi Admin @AdminStore');
        $this->sendMessage($chatId, "🏦 <b>PEMBAYARAN MANUAL</b>\n\n{$details}\n\nSetelah transfer, kirim bukti ke Admin.");
    }

    protected function confirmPurchase($chatId, $productId)
    {
        $product = Product::find($productId);
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $manualEnabled = Setting::get('manual_payment_enabled', '0');

        $text = "🎯 <b>KONFIRMASI</b>\n📦 {$product->name}\n💰 Rp " . number_format($product->price);
        $buttons = [];
        if ($user->balance >= $product->price) { $buttons[] = [['text' => "💳 Bayar Saldo", 'callback_data' => "PAY_BAL_{$product->id}"]]; }
        $buttons[] = [['text' => "📸 Bayar QRIS (Otomatis)", 'callback_data' => "PAY_QRIS_{$product->id}"]];
        
        if ($manualEnabled === '1') {
            $buttons[] = [['text' => "🏦 Bayar Manual (Transfer)", 'callback_data' => "PAY_MANUAL"]];
        }

        $buttons[] = [['text' => '⬅️ Batal', 'callback_data' => 'START_CB']];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    // (Helper methods stay the same)
    protected function sendMessage($chatId, $text, $replyMarkup = null) {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendMessage", $payload)->json();
    }
}
