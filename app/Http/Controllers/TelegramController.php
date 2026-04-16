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

            if (str_starts_with($text, '/start')) {
                $this->sendWelcome($chatId);
            } else {
                if (!str_starts_with($text, '/')) $this->executeSearch($chatId, $text);
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
            case 'action_help': $this->sendLiveCenter($chatId); break;
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
        $text .= "{$welcomeMsg}\n\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📱 <b>Pilih Menu di Bawah:</b>";

        $buttons = [
            [['text' => '🛍️ Order Produk', 'callback_data' => 'action_order'], ['text' => '💳 Cek Pembayaran', 'callback_data' => 'action_check']],
            [['text' => '🔍 Cari Produk', 'callback_data' => 'action_search'], ['text' => '⭐ Favorit', 'callback_data' => 'action_fav']],
            [['text' => '👤 Profil', 'callback_data' => 'action_profile'], ['text' => '📊 Rapor', 'callback_data' => 'action_stats'], ['text' => '💰 Deposit', 'callback_data' => 'action_deposit']],
            [['text' => '📜 Riwayat Transaksi', 'callback_data' => 'action_history'], ['text' => '🔄 Order Lagi', 'callback_data' => 'action_reorder']],
            [['text' => '📋 Panduan Order', 'callback_data' => 'action_guide'], ['text' => '🛡️ Garansi', 'callback_data' => 'action_warranty'], ['text' => '❓ FAQ', 'callback_data' => 'action_faq']],
            [['text' => '🆘 Bantuan', 'callback_data' => 'action_help'], ['text' => '📡 Live Center', 'callback_data' => 'action_live']],
            [['text' => '💬 WA Admin', 'callback_data' => 'action_wa'], ['text' => '🔔 Notif Restock', 'callback_data' => 'action_restock']]
        ];

        $bannerUrl = Setting::get('bot_banner_url');
        if ($bannerUrl) {
            $this->sendPhoto($chatId, $bannerUrl, $text, ['inline_keyboard' => $buttons]);
        } else {
            $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
        }
    }

    protected function sendCategories($chatId)
    {
        $categories = Category::all();
        $buttons = [];
        foreach ($categories as $cat) {
            $buttons[] = [['text' => "📁 {$cat->name}", 'callback_data' => "CAT_{$cat->id}"]];
        }
        $buttons[] = [['text' => "🌐 Semua Produk", 'callback_data' => "CAT_ALL"]];
        $buttons[] = [['text' => "⬅️ Kembali", 'callback_data' => 'START_CB']];
        $this->sendMessage($chatId, "🗂️ <b>PILIH KATEGORI</b>", ['inline_keyboard' => $buttons]);
    }

    protected function sendProductsByCategory($chatId, $catId)
    {
        $query = Product::where('is_active', true);
        if ($catId !== 'ALL') $query->where('category_id', $catId);
        $products = $query->get();
        $buttons = [];
        foreach ($products as $p) {
            $stock = $p->availableAssetsCount();
            if ($stock > 0) {
                $buttons[] = [['text' => "🔹 {$p->name} • Rp " . number_format($p->price), 'callback_data' => "BUY_{$p->id}"]];
            }
        }
        if (empty($buttons)) { $this->sendMessage($chatId, "⚠️ Stok kosong."); return; }
        $buttons[] = [['text' => "⬅️ Kembali", 'callback_data' => 'SHOW_CATEGORIES']];
        $this->sendMessage($chatId, "🛍️ <b>DAFTAR PRODUK</b>", ['inline_keyboard' => $buttons]);
    }

    protected function confirmPurchase($chatId, $productId)
    {
        $product = Product::find($productId);
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $isFav = Favorite::where('chat_id', $chatId)->where('product_id', $productId)->exists();

        $text = "🎯 <b>KONFIRMASI</b>\n📦 {$product->name}\n💰 Rp " . number_format($product->price);
        $buttons = [];
        if ($user->balance >= $product->price) { $buttons[] = [['text' => "💳 Bayar Saldo", 'callback_data' => "PAY_BAL_{$product->id}"]]; }
        $buttons[] = [['text' => "📸 Bayar QRIS (Instan)", 'callback_data' => "PAY_QRIS_{$product->id}"]];
        $buttons[] = [['text' => $isFav ? '❤️ Hapus Favorit' : '⭐ Favoritkan', 'callback_data' => "FAV_{$product->id}"], ['text' => '⬅️ Batal', 'callback_data' => 'START_CB']];

        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function processOrder($chatId, $productId)
    {
        $product = Product::find($productId);
        $duitku = DuitkuController::createTransaction($product, $chatId);
        Transaction::create(['reference' => $duitku['merchantOrderId'], 'chat_id' => $chatId, 'product_id' => $product->id, 'amount' => $product->price, 'status' => 'UNPAID']);

        if (isset($duitku['qrString'])) {
            $qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($duitku['qrString']);
            $this->sendPhoto($chatId, $qrImageUrl, "📦 <b>ORDER: {$product->name}</b>\n💰 Rp " . number_format($product->price) . "\nScan QRIS untuk membayar.");
        } else {
            $this->sendMessage($chatId, "🔗 <b>LINK PEMBAYARAN</b>", ['inline_keyboard' => [[['text' => 'Bayar Sekarang', 'url' => $duitku['paymentUrl'] ?? '#']]]]);
        }
    }

    protected function promptDeposit($chatId)
    {
        $buttons = [
            [['text' => 'Rp 10.000', 'callback_data' => 'DEP_10000'], ['text' => 'Rp 25.000', 'callback_data' => 'DEP_25000']],
            [['text' => 'Rp 50.000', 'callback_data' => 'DEP_50000'], ['text' => 'Rp 100.000', 'callback_data' => 'DEP_100000']],
            [['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]
        ];
        $this->sendMessage($chatId, "💰 <b>TOP UP SALDO</b>\nPilih nominal:", ['inline_keyboard' => $buttons]);
    }

    protected function processDeposit($chatId, $amount)
    {
        $duitku = DuitkuController::createDeposit($amount, $chatId);
        Deposit::create(['reference' => $duitku['merchantOrderId'], 'chat_id' => $chatId, 'amount' => $amount, 'status' => 'UNPAID']);
        if (isset($duitku['qrString'])) {
            $qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($duitku['qrString']);
            $this->sendPhoto($chatId, $qrImageUrl, "💳 <b>DEPOSIT Rp " . number_format($amount) . "</b>\nScan QRIS untuk isi saldo.");
        }
    }

    protected function executeSearch($chatId, $query)
    {
        $products = Product::where('is_active', true)->where('name', 'like', "%{$query}%")->get();
        if ($products->isEmpty()) { $this->sendMessage($chatId, "❌ Produk '{$query}' tidak ditemukan."); return; }
        $buttons = [];
        foreach ($products as $p) {
            $buttons[] = [['text' => "🔹 {$p->name} • Rp " . number_format($p->price), 'callback_data' => "BUY_{$p->id}"]];
        }
        $this->sendMessage($chatId, "🔍 <b>HASIL PENCARIAN</b>", ['inline_keyboard' => $buttons]);
    }

    protected function sendProfile($chatId)
    {
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $this->sendMessage($chatId, "👤 <b>PROFIL ANDA</b>\n💰 Saldo: Rp " . number_format($user->balance) . "\n🔗 Ref: <code>{$user->referral_code}</code>", ['inline_keyboard' => [[['text' => '💳 Top Up', 'callback_data' => 'DEPOSIT_CB'], ['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]);
    }

    protected function sendStats($chatId)
    {
        $totalPaid = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->sum('amount');
        $this->sendMessage($chatId, "📊 <b>RAPOR BELANJA</b>\n💸 Total Belanja: Rp " . number_format($totalPaid), ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]);
    }

    protected function sendStatus($chatId)
    {
        $pending = Transaction::where('chat_id', $chatId)->where('status', 'UNPAID')->latest()->first();
        if (!$pending) { $this->sendMessage($chatId, "✅ Tidak ada tagihan pending.", ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); return; }
        $this->sendMessage($chatId, "⏳ <b>TAGIHAN PENDING</b>\n📦 {$pending->product->name}\n💰 Rp " . number_format($pending->amount), ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]);
    }

    protected function sendHistory($chatId, $orderAgain = false)
    {
        $txs = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->with('product', 'digitalAsset')->latest()->take(5)->get();
        if ($txs->isEmpty()) { $this->sendMessage($chatId, "📜 Riwayat kosong.", ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); return; }
        $text = $orderAgain ? "🔄 <b>ORDER LAGI</b>" : "📜 <b>RIWAYAT</b>\n\n";
        $btns = [];
        foreach ($txs as $tx) {
            if ($orderAgain) $btns[] = [['text' => "🛒 Beli Lagi: {$tx->product->name}", 'callback_data' => "BUY_{$tx->product_id}"]];
            else $text .= "📦 {$tx->product->name}\n🔑 <code>" . ($tx->digitalAsset->data_detail ?? 'N/A') . "</code>\n\n";
        }
        $btns[] = [['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }

    protected function payWithBalance($chatId, $productId)
    {
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $product = Product::find($productId);
        if ($user->balance < $product->price) { $this->sendMessage($chatId, "❌ Saldo kurang."); return; }
        $asset = DigitalAsset::where('product_id', $productId)->where('is_used', false)->first();
        if (!$asset) { $this->sendMessage($chatId, "⚠️ Stok habis."); return; }
        $user->decrement('balance', $product->price);
        $tx = Transaction::create(['reference' => 'BAL-'.time(), 'chat_id' => $chatId, 'product_id' => $productId, 'amount' => $product->price, 'status' => 'PAID']);
        $asset->update(['is_used' => true, 'transaction_id' => $tx->id]);
        $this->sendMessage($chatId, "✅ <b>PEMBAYARAN BERHASIL</b>\n🔑 <code>{$asset->data_detail}</code>", ['inline_keyboard' => [[['text' => '⬅️ Kembali Menu', 'callback_data' => 'START_CB']]]]);
    }

    protected function toggleFavorite($chatId, $productId)
    {
        $fav = Favorite::where('chat_id', $chatId)->where('product_id', $productId)->first();
        $fav ? $fav->delete() : Favorite::create(['chat_id' => $chatId, 'product_id' => $productId]);
        $this->confirmPurchase($chatId, $productId);
    }

    protected function sendFavorites($chatId)
    {
        $favs = Favorite::with('product')->where('chat_id', $chatId)->get();
        if ($favs->isEmpty()) { $this->sendMessage($chatId, "⭐ Favorit kosong.", ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); return; }
        $btns = [];
        foreach ($favs as $f) $btns[] = [['text' => "❤️ {$f->product->name}", 'callback_data' => "BUY_{$f->product_id}"]];
        $btns[] = [['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']];
        $this->sendMessage($chatId, "⭐ <b>FAVORIT ANDA</b>", ['inline_keyboard' => $btns]);
    }

    protected function promptSearch($chatId) { $this->sendMessage($chatId, "🔍 <b>CARI PRODUK</b>\nKetik nama produk yang Anda cari:"); }
    protected function sendHelp($chatId) { $this->sendLiveCenter($chatId); }
    protected function sendGuide($chatId) { $text = Setting::get('template_guide', "📋 <b>PANDUAN</b>\n1. Pilih Produk\n2. Bayar QRIS\n3. Akun Dikirim Instan"); $this->sendMessage($chatId, $text, ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); }
    protected function sendFaqs($chatId) { $faqs = Faq::all(); $text = "❓ <b>FAQ</b>\n\n"; foreach($faqs as $f) $text .= "<b>Q: {$f->question}</b>\nA: {$f->answer}\n\n"; $this->sendMessage($chatId, $text, ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); }
    protected function sendWarranty($chatId) { $text = Setting::get('template_warranty', "🛡️ <b>GARANSI</b>\nBergaransi ganti baru jika akun mati."); $this->sendMessage($chatId, $text, ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); }
    protected function sendLiveCenter($chatId)
    {
        $user = TelegramUser::where('chat_id', $chatId)->first();
        $lastTx = Transaction::where('chat_id', $chatId)->with('product')->latest()->first();
        $text = "🟢 <b>LIVE CENTER</b>\n👤 Akun : @{$user->username}\n🆔 ID    : <code>{$chatId}</code>\n꧁━━━━꧂\n💰 Saldo : Rp " . number_format($user->balance) . "\n📦 Terakhir: " . ($lastTx ? $lastTx->product->name : 'N/A');
        $btns = [[['text' => '🆘 Bantuan Cepat', 'callback_data' => 'HELP_CB'], ['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $btns]);
    }
    protected function sendWaLink($chatId) { $wa = Setting::get('admin_whatsapp', '628123456789'); $this->sendMessage($chatId, "💬 <b>WHATSAPP</b>\nwa.me/{$wa}", ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); }
    protected function sendRestockMenu($chatId) { $this->sendMessage($chatId, "🔔 <b>RESTOCK</b>\nFitur segera hadir.", ['inline_keyboard' => [[['text' => '⬅️ Kembali', 'callback_data' => 'START_CB']]]]); }

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
