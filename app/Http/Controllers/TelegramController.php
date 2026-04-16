<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
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

            TelegramUser::updateOrCreate(
                ['chat_id' => $chatId],
                [
                    'username' => $from['username'] ?? null,
                    'first_name' => $from['first_name'] ?? null,
                ]
            );

            if ($text === '/start') {
                $this->sendWelcome($chatId);
            } elseif ($text === '/history') {
                $this->sendHistory($chatId);
            } elseif ($text === '/status') {
                $this->sendStatus($chatId);
            } elseif ($text === '/help') {
                $this->sendHelp($chatId);
            }
        } elseif (isset($update['callback_query'])) {
            $chatId = $update['callback_query']['message']['chat']['id'];
            $data = $update['callback_query']['data'];

            if ($data === 'SHOW_CATEGORIES') {
                $this->sendCategories($chatId);
            } elseif ($data === 'HISTORY_CB') {
                $this->sendHistory($chatId);
            } elseif ($data === 'HELP_CB') {
                $this->sendHelp($chatId);
            } elseif ($data === 'START_CB') {
                $this->sendWelcome($chatId);
            } elseif (str_starts_with($data, 'CAT_')) {
                $this->sendProductsByCategory($chatId, str_replace('CAT_', '', $data));
            } elseif (str_starts_with($data, 'BUY_')) {
                $this->processOrder($chatId, str_replace('BUY_', '', $data));
            }
        }

        return response()->json(['status' => 'ok']);
    }

    protected function sendWelcome($chatId)
    {
        $text = "✨ <b>SELAMAT DATANG DI ZONA AKUN PREMIUM</b> ✨\n\n";
        $text .= "Solusi otomatis untuk kebutuhan <b>Akun Premium & Digital Assets</b> Anda. Transaksi aman, cepat, dan instan 24/7.\n\n";
        $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        $text .= "📱 <b>Menu Navigasi:</b>";

        $buttons = [
            [['text' => '🛍️ Mulai Berbelanja', 'callback_data' => 'SHOW_CATEGORIES']],
            [
                ['text' => '📜 Riwayat', 'callback_data' => 'HISTORY_CB'],
                ['text' => '❓ Bantuan', 'callback_data' => 'HELP_CB']
            ],
        ];

        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
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

        $this->sendMessage($chatId, "🗂️ <b>PILIH KATEGORI PRODUK</b>\n\nSilakan pilih kategori yang Anda inginkan:", ['inline_keyboard' => $buttons]);
    }

    protected function sendProductsByCategory($chatId, $catId)
    {
        $query = Product::where('is_active', true);
        if ($catId !== 'ALL') $query->where('category_id', $catId);
        
        $products = $query->get();
        $buttons = [];

        foreach ($products as $product) {
            $stock = $product->availableAssetsCount();
            if ($stock > 0) {
                $buttons[] = [[
                    'text' => "🔹 {$product->name} • Rp " . number_format($product->price, 0, ',', '.') . " (Stok: {$stock})",
                    'callback_data' => "BUY_{$product->id}"
                ]];
            }
        }

        if (empty($buttons)) {
            $this->sendMessage($chatId, "⚠️ <b>MAAF</b>\n\nSaat ini produk di kategori ini sedang kosong. Silakan cek kategori lain.");
            return;
        }

        $buttons[] = [['text' => "⬅️ Kembali ke Kategori", 'callback_data' => 'SHOW_CATEGORIES']];

        $this->sendMessage($chatId, "🛍️ <b>DAFTAR PRODUK TERSEDIA</b>\n\nKlik pada nama produk untuk melakukan pemesanan:", ['inline_keyboard' => $buttons]);
    }

    protected function processOrder($chatId, $productId)
    {
        $product = Product::find($productId);
        if (!$product || $product->availableAssetsCount() <= 0) {
            $this->sendMessage($chatId, "❌ <b>Gagal:</b> Stok produk baru saja habis.");
            return;
        }

        $loadingMsg = $this->sendMessage($chatId, "⏳ <b>Menyiapkan pesanan Anda...</b>");

        $duitku = DuitkuController::createTransaction($product, $chatId);

        if (isset($duitku['qrString']) || isset($duitku['paymentUrl'])) {
            Transaction::create([
                'reference' => $duitku['merchantOrderId'],
                'chat_id' => $chatId,
                'product_id' => $product->id,
                'amount' => $product->price,
                'status' => 'UNPAID'
            ]);

            if (isset($loadingMsg['result']['message_id'])) {
                Http::post("{$this->apiUrl}/deleteMessage", ['chat_id' => $chatId, 'message_id' => $loadingMsg['result']['message_id']]);
            }

            if (isset($duitku['qrString'])) {
                $qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($duitku['qrString']);
                
                $caption = "📋 <b>RINCIAN PESANAN</b>\n";
                $caption .= "━━━━━━━━━━━━━━━━━━━━\n";
                $caption .= "📦 <b>Produk:</b> {$product->name}\n";
                $caption .= "💰 <b>Total:</b> <code>Rp " . number_format($product->price, 0, ',', '.') . "</code>\n";
                $caption .= "🆔 <b>Order ID:</b> <code>" . $duitku['merchantOrderId'] . "</code>\n";
                $caption .= "━━━━━━━━━━━━━━━━━━━━\n\n";
                $caption .= "✅ <b>INSTRUKSI PEMBAYARAN:</b>\n";
                $caption .= "1. Scan QRIS di atas melalui aplikasi bank/e-wallet Anda.\n";
                $caption .= "2. Pastikan nominal sesuai dengan tagihan.\n";
                $caption .= "3. Akun akan dikirim <b>Instan</b> setelah bayar.";

                Http::post("{$this->apiUrl}/sendPhoto", [
                    'chat_id' => $chatId,
                    'photo' => $qrImageUrl,
                    'caption' => $caption,
                    'parse_mode' => 'HTML'
                ]);
            } else {
                $text = "📋 <b>RINCIAN PESANAN</b>\n";
                $text .= "━━━━━━━━━━━━━━━━━━━━\n";
                $text .= "📦 <b>Produk:</b> {$product->name}\n";
                $text .= "💰 <b>Total:</b> <code>Rp " . number_format($product->price, 0, ',', '.') . "</code>\n";
                $text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
                $text .= "Silakan klik tombol di bawah untuk membayar:";

                $this->sendMessage($chatId, $text, [
                    'inline_keyboard' => [[['text' => '💳 Bayar Sekarang', 'url' => $duitku['paymentUrl']]]]
                ]);
            }
        } else {
            $this->sendMessage($chatId, "❌ <b>Error:</b> Gagal membuat transaksi. Hubungi @Admin.");
        }
    }

    protected function sendHistory($chatId)
    {
        $transactions = Transaction::where('chat_id', $chatId)->where('status', 'PAID')->with(['product', 'digitalAsset'])->latest()->take(5)->get();

        if ($transactions->isEmpty()) {
            $this->sendMessage($chatId, "📜 <b>RIWAYAT KOSONG</b>\n\nAnda belum pernah melakukan pembelian di store ini.");
            return;
        }

        $text = "📜 <b>5 RIWAYAT PEMBELIAN TERAKHIR</b>\n\n";
        foreach ($transactions as $tx) {
            $text .= "📅 " . $tx->created_at->format('d/m/Y H:i') . "\n";
            $text .= "📦 <b>" . $tx->product->name . "</b>\n";
            $text .= "🔑 Data: <code>" . ($tx->digitalAsset->data_detail ?? 'N/A') . "</code>\n";
            $text .= "━━━━━━━━━━━━━━━━━━━━\n";
        }

        $this->sendMessage($chatId, $text);
    }

    protected function sendHelp($chatId)
    {
        $text = "❓ <b>PUSAT BANTUAN</b>\n\n";
        $text .= "Mengalami kendala? Admin kami siap membantu Anda.\n\n";
        $text .= "👤 <b>CS Telegram:</b> @AdminStore\n";
        $text .= "🕒 <b>Jam Operasional:</b> 08:00 - 22:00 WIB\n\n";
        $text .= "<b>Panduan Singkat:</b>\n";
        $text .= "• Produk dikirim otomatis via chat ini.\n";
        $text .= "• Masa garansi mengikuti paket yang dibeli.\n";
        $text .= "• Jangan memberikan Order ID ke siapapun.";

        $this->sendMessage($chatId, $text);
    }

    protected function sendMessage($chatId, $text, $replyMarkup = null)
    {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        $response = Http::post("{$this->apiUrl}/sendMessage", $payload);
        return $response->json();
    }
}
