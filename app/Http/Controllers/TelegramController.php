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
        elseif ($data === 'action_stats') $this->sendLeaderboard($chatId);
        elseif ($data === 'START_CB') $this->sendWelcome($chatId);
        elseif (str_starts_with($data, 'WAIT_')) $this->addToWaitlist($chatId, str_replace('WAIT_', '', $data));
        elseif (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
        elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
        elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
        elseif (str_starts_with($data, 'GIFT_')) $this->promptGift($chatId, str_replace('GIFT_', '', $data));
        
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function sendWelcome($chatId)
    {
        $text = "✨ <b>EMPIRE CONSOLE</b> ✨\n\nSelamat datang di pusat aset digital premium. Pilih menu di bawah:";
        $btns = [
            [['text' => '🛍️ Order Produk', 'callback_data' => 'action_order'], ['text' => '🏆 Leaderboard', 'callback_data' => 'action_stats']],
            [['text' => '👤 Profil', 'callback_data' => 'action_profile'], ['text' => '💰 Deposit', 'callback_data' => 'action_deposit']],
            [['text' => '📋 Panduan', 'callback_data' => 'action_guide'], ['text' => '🛡️ Garansi', 'callback_data' => 'action_warranty']]
        ];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }

    protected function sendLeaderboard($chatId)
    {
        $top = TelegramUser::select('first_name', DB::raw('count(id) as refs'))
            ->whereNotNull('referred_by')->groupBy('first_name')->orderBy('refs', 'DESC')->take(5)->get();
        
        $text = "🏆 <b>REFERRAL LEADERBOARD</b>\n━━━━━━━━━━━━━━━━━━━━\n\n";
        $icons = ['🥇', '🥈', '🥉', '🎗️', '🎗️'];
        foreach ($top as $i => $u) {
            $text .= "{$icons[$i]} <b>{$u->first_name}</b> — {$u->refs} Referrals\n";
        }
        $text .= "\n🔗 <i>Undang teman dan naikkan peringkat Anda!</i>";
        $this->sendMessage($chatId, $text, ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]);
    }

    protected function sendProductsByCategory($chatId, $catId)
    {
        $products = Product::where('is_active', true)->where('category_id', $catId)->get();
        $btns = [];
        foreach ($products as $p) {
            $stock = $p->availableAssetsCount();
            if ($stock > 0) {
                $urgency = ($stock <= 2) ? " ⚠️ LIMIT" : "";
                $btns[] = [['text' => "🔹 {$p->name} • Rp ".number_format($p->price)." ({$stock}{$urgency})", 'callback_data' => "BUY_{$p->id}"]];
            } else {
                $btns[] = [['text' => "❌ {$p->name} (Habis) — Ingatkan Saya", 'callback_data' => "WAIT_{$p->id}"]];
            }
        }
        $this->sendMessage($chatId, "🛍️ <b>PILIH PRODUK</b>", ['inline_keyboard' => $btns]);
    }

    protected function addToWaitlist($chatId, $productId)
    {
        RestockNotification::updateOrCreate(['chat_id' => $chatId, 'product_id' => $productId], ['is_notified' => false]);
        $this->sendMessage($chatId, "✅ <b>WAITLIST AKTIF!</b>\n\nKami akan mengirimkan notifikasi instan saat stok produk ini tersedia kembali.");
    }

    protected function promptGift($chatId, $productId)
    {
        $this->sendMessage($chatId, "🎁 <b>GIFT SYSTEM</b>\n\nSilakan teruskan pesan ini ke teman Anda, atau minta mereka mengirimkan <b>Chat ID</b> mereka ke Anda.\n\nKetik: <code>/gift {$productId} CHAT_ID_PENERIMA</code>");
    }

    protected function sendMessage($chatId, $text, $replyMarkup = null) {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendMessage", $payload)->json();
    }
}
