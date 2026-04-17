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
            if (Setting::get('maintenance_mode', '0') === '1' && $chatId != Setting::get('admin_chat_id')) {
                $this->sendMessage($chatId, "🚧 <b>MAINTENANCE MODE</b>\n\nMaaf bos, toko sedang libur sebentar untuk restock besar-besaran! Silakan cek kembali nanti ya.");
                return response()->json(['status' => 'maintenance']);
            }
            if (Cache::has('spam_'.$chatId)) return response()->json(['status' => 'limit']);
            Cache::put('spam_'.$chatId, true, 1);

            $text = $update['message']['text'] ?? '';
            $from = $update['message']['from'];
            TelegramUser::updateOrCreate(['chat_id' => $chatId], ['username' => $from['username'] ?? null, 'first_name' => $from['first_name'] ?? null]);

            switch ($text) {
                case '/start': $this->sendWelcome($chatId); break;
                case '🛍️ Katalog Produk': $this->sendCategories($chatId); break;
                case '👤 Profil Saya': $this->sendProfile($chatId); break;
                case '💰 Isi Saldo': $this->promptDeposit($chatId); break;
                case '🏆 Papan Peringkat': $this->sendLeaderboard($chatId); break;
                case '❓ Bantuan & FAQ': $this->sendFaqs($chatId); break;
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
        elseif ($data === 'action_deposit') $this->promptDeposit($chatId);
        elseif (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
        elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
        elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
        elseif (str_starts_with($data, 'PAY_BAL_')) $this->payWithBalance($chatId, str_replace('PAY_BAL_', '', $data));
        elseif (str_starts_with($data, 'WAIT_')) $this->addToWaitlist($chatId, str_replace('WAIT_', '', $data));
        elseif (str_starts_with($data, 'DEP_')) $this->processDeposit($chatId, str_replace('DEP_', '', $data));
        elseif (str_starts_with($data, 'RATE_')) $this->processRating($chatId, str_replace('RATE_', '', $data));
        
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function sendWelcome($chatId)
    {
        $storeName = Setting::get('store_name', 'Zona Akun Premium');
        $text = "✨ <b>SELAMAT DATANG DI " . strtoupper($storeName) . "</b> ✨\n\nPusat akun FnB premium otomatis 24 jam.\n\n📱 <b>Navigasi Menu:</b>";
        $keyboard = [['🛍️ Katalog Produk', '👤 Profil Saya'], ['💰 Isi Saldo', '🏆 Papan Peringkat'], ['❓ Bantuan & FAQ']];
        $banner = Setting::get('bot_banner_url');
        if ($banner) $this->sendPhoto($chatId, $banner, $text, ['keyboard' => $keyboard, 'resize_keyboard' => true]);
        else $this->sendMessage($chatId, $text, ['keyboard' => $keyboard, 'resize_keyboard' => true]);
    }

    protected function sendCategories($chatId)
    {
        $cats = Category::all();
        $btns = [];
        foreach ($cats as $c) $btns[] = [['text' => "📁 {$c->name}", 'callback_data' => "CAT_{$c->id}"]];
        $btns[] = [['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']];
        $this->sendMessage($chatId, "🗂️ <b>PILIH KATEGORI</b>", ['inline_keyboard' => $btns]);
    }

    protected function sendProductsByCategory($chatId, $catId)
    {
        $products = Product::where('category_id', $catId)->where('is_active', true)->get();
        $btns = [];
        foreach ($products as $p) {
            $stock = $p->availableAssetsCount();
            $label = $stock > 0 ? "🔹 {$p->name} • Rp ".number_format($p->price)." ({$stock})" : "❌ {$p->name} (Habis)";
            $btns[] = [['text' => $label, 'callback_data' => "BUY_{$p->id}"]];
        }
        $btns[] = [['text' => '⬅️ Kembali', 'callback_data' => 'action_order']];
        $this->sendMessage($chatId, "🛍️ <b>PILIH PRODUK</b>", ['inline_keyboard' => $btns]);
    }

    protected function confirmPurchase($chatId, $productId)
    {
        $p = Product::find($productId);
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $text = "🎯 <b>DETAIL PRODUK</b>\n━━━━━━━━━━━━━━━━━━━━\n📦 <b>Produk:</b> {$p->name}\n💰 <b>Harga:</b> Rp " . number_format($p->price) . "\n📝 <b>Info:</b> " . ($p->description ?: 'Instan & Aman') . "\n━━━━━━━━━━━━━━━━━━━━";
        $btns = [];
        if ($user->balance >= $p->price) $btns[] = [['text' => "💳 Bayar Pakai Saldo (Rp ".number_format($user->balance).")", 'callback_data' => "PAY_BAL_{$p->id}"]];
        $btns[] = [['text' => "📸 Bayar QRIS (Otomatis)", 'callback_data' => "PAY_QRIS_{$p->id}"]];
        $btns[] = [['text' => '⬅️ Batal', 'callback_data' => 'START_CB']];
        if ($p->image_url) $this->sendPhoto($chatId, $p->image_url, $text, ['inline_keyboard' => $btns]);
        else $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }

    protected function payWithBalance($chatId, $productId)
    {
        $u = TelegramUser::where('chat_id', $chatId)->first();
        $p = Product::find($productId);
        if ($u->balance < $p->price) { $this->sendMessage($chatId, "❌ Saldo kurang."); return; }
        $asset = DigitalAsset::where('product_id', $productId)->where('is_used', false)->first();
        if (!$asset) { $this->sendMessage($chatId, "⚠️ Stok habis."); return; }
        
        $u->decrement('balance', $p->price);
        $tx = Transaction::create(['reference' => 'BAL-'.time(), 'chat_id' => $chatId, 'product_id' => $productId, 'amount' => $p->price, 'status' => 'PAID']);
        $asset->update(['is_used' => true, 'transaction_id' => $tx->id]);

        // WATCHDOG ALERT
        $rem = DigitalAsset::where('product_id', $productId)->where('is_used', false)->count();
        if ($rem < 5) AdminController::alertOwner("⚠️ <b>STOCK ALERT:</b> {$p->name} sisa {$rem}!");

        $this->sendMessage($chatId, "✅ <b>PEMBAYARAN BERHASIL</b>\n\n🔑 <b>DATA AKUN:</b>\n<code>{$asset->data_detail}</code>");
    }

    protected function processOrder($chatId, $productId)
    {
        $p = Product::find($productId);
        $duitku = DuitkuController::createTransaction($p, $chatId);
        Transaction::create(['reference' => $duitku['merchantOrderId'], 'chat_id' => $chatId, 'product_id' => $p->id, 'amount' => $p->price, 'status' => 'UNPAID']);
        if (isset($duitku['qrString'])) {
            $qr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($duitku['qrString']);
            $this->sendPhoto($chatId, $qr, "✅ <b>TAGIHAN DIBUAT</b>\n\nScan QRIS untuk <b>{$p->name}</b>.");
        }
    }

    protected function sendProfile($chatId) {
        $u = TelegramUser::where('chat_id', $chatId)->first();
        $this->sendMessage($chatId, "👤 <b>PROFIL ANDA</b>\n💰 Saldo: Rp " . number_format($u->balance) . "\n🔗 Ref: <code>{$u->referral_code}</code>", ['inline_keyboard' => [[['text' => '💰 Top Up', 'callback_data' => 'action_deposit']]]]);
    }

    protected function promptDeposit($chatId) {
        $btns = [[['text' => 'Rp 10k', 'callback_data' => 'DEP_10000'], ['text' => 'Rp 25k', 'callback_data' => 'DEP_25000']], [['text' => 'Rp 50k', 'callback_data' => 'DEP_50000'], ['text' => 'Rp 100k', 'callback_data' => 'DEP_100000']]];
        $this->sendMessage($chatId, "💰 <b>TOP UP SALDO</b>\nSilakan pilih nominal:", ['inline_keyboard' => $btns]);
    }

    protected function processDeposit($chatId, $amount) {
        $duitku = DuitkuController::createDeposit($amount, $chatId);
        Deposit::create(['reference' => $duitku['merchantOrderId'], 'chat_id' => $chatId, 'amount' => $amount, 'status' => 'UNPAID']);
        if (isset($duitku['qrString'])) {
            $qr = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($duitku['qrString']);
            $this->sendPhoto($chatId, $qr, "💳 <b>ISI SALDO Rp ".number_format($amount)."</b>\nScan QRIS untuk membayar.");
        }
    }

    protected function sendLeaderboard($chatId) {
        $top = TelegramUser::select('first_name', DB::raw('count(id) as refs'))->whereNotNull('referred_by')->groupBy('first_name')->orderBy('refs', 'DESC')->take(5)->get();
        $text = "🏆 <b>LEADERBOARD REFERRAL</b>\n\n";
        foreach($top as $i => $u) $text .= ($i+1).". <b>{$u->first_name}</b> : {$u->refs} Reff\n";
        $this->sendMessage($chatId, $text);
    }

    protected function sendFaqs($chatId) {
        $faqs = Faq::all(); $text = "❓ <b>FAQ & BANTUAN</b>\n\n";
        foreach($faqs as $f) $text .= "<b>Q: {$f->question}</b>\nA: {$f->answer}\n\n";
        $this->sendMessage($chatId, $text);
    }

    protected function executeSearch($chatId, $q) {
        $ps = Product::where('name', 'like', "%{$q}%")->where('is_active', true)->get();
        if ($ps->isEmpty()) { $this->sendMessage($chatId, "❌ Produk tidak ditemukan."); return; }
        $btns = []; foreach($ps as $p) $btns[] = [['text' => "🔹 {$p->name} • Rp ".number_format($p->price), 'callback_data' => "BUY_{$p->id}"]];
        $this->sendMessage($chatId, "🔍 <b>HASIL PENCARIAN</b>", ['inline_keyboard' => $btns]);
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
