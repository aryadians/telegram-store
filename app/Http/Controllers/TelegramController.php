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

    public function __construct() { 
        $this->token = env('TELEGRAM_BOT_TOKEN'); 
        $this->apiUrl = "https://api.telegram.org/bot{$this->token}"; 
    }

    public function webhook(Request $request)
    {
        $update = $request->all();
        if (isset($update['message'])) {
            $chatId = $update['message']['chat']['id'];
            
            // Real-time Maintenance Check
            if (Setting::get('maintenance_mode', '0') === '1' && $chatId != Setting::get('admin_chat_id')) {
                $this->sendMessage($chatId, "🚧 <b>SISTEM MAINTENANCE</b>\n\nMaaf, sistem sedang diperbarui oleh Admin. Silakan coba beberapa saat lagi.");
                return response()->json(['status' => 'maintenance']);
            }

            if (Cache::has('spam_'.$chatId)) return response()->json(['status' => 'limit']);
            Cache::put('spam_'.$chatId, true, 1);

            $text = $update['message']['text'] ?? '';
            $from = $update['message']['from'];
            $user = TelegramUser::updateOrCreate(['chat_id' => $chatId], [
                'username' => $from['username'] ?? null, 
                'first_name' => $from['first_name'] ?? null
            ]);

            // Handle Gift Command: /gift {productId} {recipientChatId}
            if (str_starts_with($text, '/gift ')) {
                $this->processGiftCommand($chatId, $text);
                return response()->json(['status' => 'ok']);
            }

            switch ($text) {
                case '/start': $this->sendWelcome($chatId); break;
                case '🛍️ Katalog Produk': $this->sendCategories($chatId); break;
                case '👤 Profil Saya': $this->sendProfile($chatId); break;
                case '💰 Isi Saldo': $this->promptDeposit($chatId); break;
                case '🏆 Papan Peringkat': $this->sendLeaderboard($chatId); break;
                case '❓ Bantuan & FAQ': $this->sendFaqs($chatId); break;
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
        if (Setting::get('maintenance_mode', '0') === '1' && $chatId != Setting::get('admin_chat_id')) {
            Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id'], 'text' => 'Maintenance Active', 'show_alert' => true]);
            return;
        }

        if ($data === 'action_order') $this->sendCategories($chatId);
        elseif ($data === 'START_CB') $this->sendWelcome($chatId);
        elseif (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
        elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
        elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
        elseif (str_starts_with($data, 'WAIT_')) $this->addToWaitlist($chatId, str_replace('WAIT_', '', $data));
        
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function sendWelcome($chatId)
    {
        $storeName = Setting::get('store_name', 'Zona Akun Premium');
        $text = "✨ <b>SELAMAT DATANG DI " . strtoupper($storeName) . "</b> ✨\n\nNikmati kemudahan akses aset digital premium dengan sistem otomatisasi 24 jam.\n\n📱 <b>Gunakan menu permanen di bawah untuk navigasi cepat!</b>";
        
        // PERSISTENT REPLY KEYBOARD
        $keyboard = [
            ['🛍️ Katalog Produk', '👤 Profil Saya'],
            ['💰 Isi Saldo', '🏆 Papan Peringkat'],
            ['❓ Bantuan & FAQ']
        ];

        // INLINE ACTIONS
        $inlineBtns = [
            [['text' => '🔥 Promo Spesial', 'callback_data' => 'action_order'], ['text' => '🛒 Order Terakhir', 'callback_data' => 'action_history']]
        ];

        $banner = Setting::get('bot_banner_url');
        $payload = [
            'chat_id' => $chatId,
            'reply_markup' => json_encode([
                'keyboard' => $keyboard,
                'resize_keyboard' => true,
                'persistent' => true
            ])
        ];

        if ($banner) {
            $payload['photo'] = $banner;
            $payload['caption'] = $text;
            $payload['parse_mode'] = 'HTML';
            $payload['reply_markup'] = json_encode([
                'keyboard' => $keyboard, 'resize_keyboard' => true, 'inline_keyboard' => $inlineBtns[0]
            ]);
            Http::post("{$this->apiUrl}/sendPhoto", $payload);
        } else {
            $payload['text'] = $text;
            $payload['parse_mode'] = 'HTML';
            $payload['reply_markup'] = json_encode([
                'keyboard' => $keyboard, 'resize_keyboard' => true, 'inline_keyboard' => $inlineBtns[0]
            ]);
            Http::post("{$this->apiUrl}/sendMessage", $payload);
        }
    }

    // (Support methods for logic restoration...)
    protected function sendCategories($chatId) {
        $categories = Category::all();
        $btns = [];
        foreach ($categories as $cat) { $btns[] = [['text' => "📁 {$cat->name}", 'callback_data' => "CAT_{$cat->id}"]]; }
        $btns[] = [['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']];
        $this->sendMessage($chat_id ?? $chatId, "🗂️ <b>ETALASE KATEGORI</b>", ['inline_keyboard' => $btns]);
    }

    protected function sendProductsByCategory($chatId, $catId) {
        $products = Product::where('is_active', true)->where('category_id', $catId)->get();
        $btns = [];
        foreach ($products as $p) {
            $stock = $p->availableAssetsCount();
            $label = $stock > 0 ? "🔹 {$p->name} • Rp ".number_format($p->price)." ({$stock})" : "❌ {$p->name} (Habis)";
            $btns[] = [['text' => $label, 'callback_data' => "BUY_{$p->id}"]];
        }
        $this->sendMessage($chatId, "🛍️ <b>PILIH PRODUK</b>", ['inline_keyboard' => $btns]);
    }

    protected function confirmPurchase($chatId, $productId) {
        $product = Product::find($productId);
        $text = "🎯 <b>DETAIL PESANAN</b>\n━━━━━━━━━━━━━━━━━━━━\n📦 <b>Produk:</b> {$product->name}\n💰 <b>Harga:</b> Rp " . number_format($product->price) . "\n━━━━━━━━━━━━━━━━━━━━";
        $btns = [[['text' => '📸 Bayar Sekarang (QRIS)', 'callback_data' => "PAY_QRIS_{$product->id}"]], [['text' => '⬅️ Batal', 'callback_data' => 'START_CB']]];
        if ($product->image_url) $this->sendPhoto($chatId, $product->image_url, $text, ['inline_keyboard' => $btns]);
        else $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }

    protected function processOrder($chatId, $productId) {
        $product = Product::find($productId);
        $duitku = DuitkuController::createTransaction($product, $chatId);
        Transaction::create(['reference' => $duitku['merchantOrderId'], 'chat_id' => $chatId, 'product_id' => $product->id, 'amount' => $product->price, 'status' => 'UNPAID']);
        if (isset($duitku['qrString'])) {
            $qr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($duitku['qrString']);
            $this->sendPhoto($chatId, $qr, "✅ <b>TAGIHAN DIBUAT</b>\n\nScan QRIS di atas untuk membayar <b>{$product->name}</b>.");
        }
    }

    protected function sendProfile($chatId) {
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $text = "👤 <b>PROFIL SULTAN</b>\n━━━━━━━━━━━━━━━━━━━━\n💰 Saldo : Rp " . number_format($user->balance) . "\n🔗 Ref   : <code>{$user->referral_code}</code>\n━━━━━━━━━━━━━━━━━━━━";
        $this->sendMessage($chatId, $text, ['inline_keyboard' => [[['text' => '💰 Top Up Saldo', 'callback_data' => 'action_deposit']]]]);
    }

    protected function sendLeaderboard($chatId) {
        $top = TelegramUser::select('first_name', DB::raw('count(id) as refs'))->whereNotNull('referred_by')->groupBy('first_name')->orderBy('refs', 'DESC')->take(5)->get();
        $text = "🏆 <b>REFERRAL LEADERBOARD</b>\n\n";
        $icons = ['🥇','🥈','🥉','🎗️','🎗️'];
        foreach($top as $i => $u) { $text .= "{$icons[$i]} <b>{$u->first_name}</b> : {$u->refs} Reff\n"; }
        $this->sendMessage($chatId, $text);
    }

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
