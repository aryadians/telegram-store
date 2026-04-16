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

            $user = TelegramUser::updateOrCreate(['chat_id' => $chatId], [
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
                
                // VOUCHER COMMAND: /claim KODE
                case str_starts_with($text, '/claim '): 
                    $this->applyVoucher($chatId, str_replace('/claim ', '', $text)); 
                    break;

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
        if ($data === 'SHOW_CATEGORIES') $this->sendCategories($chatId);
        elseif ($data === 'START_CB') $this->sendWelcome($chatId);
        elseif ($data === 'PROMPT_VOUCHER') $this->sendMessage($chatId, "🎟️ <b>KLAIM VOUCHER</b>\n\nSilakan ketik perintah: <code>/claim KODE_VOUCHER</code>\nContoh: <code>/claim SULTANIRIT</code>");
        elseif (str_starts_with($data, 'CAT_')) $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
        elseif (str_starts_with($data, 'BUY_')) $this->confirmPurchase($chatId, str_replace('BUY_', '', $data));
        elseif (str_starts_with($data, 'PAY_QRIS_')) $this->processOrder($chatId, str_replace('PAY_QRIS_', '', $data));
        elseif (str_starts_with($data, 'PAY_BAL_')) $this->payWithBalance($chatId, str_replace('PAY_BAL_', '', $data));
        elseif (str_starts_with($data, 'DEP_')) $this->processDeposit($chatId, str_replace('DEP_', '', $data));
        elseif (str_starts_with($data, 'RATE_')) $this->processRating($chatId, str_replace('RATE_', '', $data));
        
        Http::post("{$this->apiUrl}/answerCallbackQuery", ['callback_query_id' => $query['id']]);
    }

    protected function processRating($chatId, $data)
    {
        // Format: {transaction_id}_{stars}
        $parts = explode('_', $data);
        if (count($parts) < 2) return;
        
        $txId = $parts[0];
        $stars = $parts[1];

        Rating::updateOrCreate(['transaction_id' => $txId], ['stars' => $stars]);

        $msg = "💖 <b>TERIMA KASIH!</b>\n\nAnda memberikan rating ⭐ {$stars} untuk pembelian ini. Dukungan Anda sangat berarti bagi kami!";
        $this->sendMessage($chatId, $msg);
    }

    protected function sendWelcome($chatId)
    {
        $storeName = Setting::get('store_name', 'Zona Akun Premium');
        $text = "✨ <b>" . strtoupper($storeName) . "</b> ✨\n\nAutomated Digital Store Terpercaya. Pilih menu untuk mulai.";
        $keyboard = [['🛍️ Order Produk', '💳 Cek Pembayaran'], ['🔍 Cari Produk', '⭐ Favorit'], ['👤 Profil', '📊 Rapor', '💰 Deposit'], ['📜 Riwayat Transaksi', '🔄 Order Lagi'], ['📋 Panduan Order', '🛡️ Garansi', '❓ FAQ'], ['🆘 Bantuan', '📡 Live Center'], ['💬 WA Admin', '🔔 Notif Restock']];
        $this->sendMessage($chatId, $text, ['keyboard' => $keyboard, 'resize_keyboard' => true]);
    }

    protected function confirmPurchase($chatId, $productId)
    {
        $product = Product::find($productId);
        $text = "🎯 <b>KONFIRMASI PESANAN</b>\n━━━━━━━━━━━━━━━━━━━━\n📦 <b>Produk:</b> {$product->name}\n💰 <b>Harga:</b> Rp " . number_format($product->price) . "\n━━━━━━━━━━━━━━━━━━━━\n\nPilih metode pembayaran:";
        $buttons = [
            [['text' => '📸 Bayar QRIS (Instan)', 'callback_data' => "PAY_QRIS_{$product->id}"]],
            [['text' => '💳 Bayar Pakai Saldo', 'callback_data' => "PAY_BAL_{$product->id}"]],
            [['text' => '🎟️ Masukkan Voucher', 'callback_data' => "PROMPT_VOUCHER"]],
            [['text' => '⬅️ Batal', 'callback_data' => 'START_CB']]
        ];
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function applyVoucher($chatId, $code)
    {
        $voucher = Voucher::where('code', strtoupper($code))->where('is_active', true)->first();
        if (!$voucher || ($voucher->limit > 0 && $voucher->used >= $voucher->limit)) {
            $this->sendMessage($chatId, "❌ <b>Voucher Tidak Valid</b>\nKode tersebut salah atau sudah habis masa berlakunya.");
            return;
        }

        $text = "🎊 <b>VOUCHER BERHASIL!</b>\n";
        $text .= "Kode: <code>{$voucher->code}</code>\n";
        $text .= "Benefit: " . ($voucher->type === 'percent' ? $voucher->value . "%" : "Rp " . number_format($voucher->value)) . "\n\n";
        $text .= "Silakan lakukan pemesanan kembali, potongan akan otomatis diterapkan!";
        
        $this->sendMessage($chatId, $text, ['inline_keyboard' => [[['text' => '🛍️ Belanja Sekarang', 'callback_data' => 'SHOW_CATEGORIES']]]]);
    }

    protected function sendMessage($chatId, $text, $replyMarkup = null) {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        return Http::post("{$this->apiUrl}/sendMessage", $payload)->json();
    }
}
