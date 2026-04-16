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

            // TRACK USER
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
        $text = "👋 <b>Selamat Datang di Toko Digital Kami!</b>\n\n";
        $text .= "Silakan gunakan menu di bawah untuk mulai berbelanja atau melihat riwayat pesanan Anda.";

        $buttons = [
            [['text' => '🛍️ Belanja Sekarang', 'callback_data' => 'SHOW_CATEGORIES']],
            [['text' => '📜 Riwayat Pembelian', 'callback_data' => 'HISTORY_CB']], // we can also handle this in callback
        ];

        // Since we already have /history command, we can just use buttons for better UX
        $this->sendMessage($chatId, $text, ['inline_keyboard' => $buttons]);
    }

    protected function sendCategories($chatId)
    {
        $categories = Category::all();
        $buttons = [];

        foreach ($categories as $cat) {
            $buttons[] = [['text' => "📁 {$cat->name}", 'callback_data' => "CAT_{$cat->id}"]];
        }

        // Add "All Products" option
        $buttons[] = [['text' => "🌐 Semua Produk", 'callback_data' => "CAT_ALL"]];

        $this->sendMessage($chatId, "📁 <b>Silakan Pilih Kategori:</b>", ['inline_keyboard' => $buttons]);
    }

    protected function sendProductsByCategory($chatId, $catId)
    {
        $query = Product::where('is_active', true);
        
        if ($catId !== 'ALL') {
            $query->where('category_id', $catId);
        }

        $products = $query->get();
        $buttons = [];

        foreach ($products as $product) {
            $stock = $product->availableAssetsCount();
            if ($stock > 0) {
                $buttons[] = [[
                    'text' => "{$product->name} - Rp " . number_format($product->price, 0, ',', '.') . " ({$stock})",
                    'callback_data' => "BUY_{$product->id}"
                ]];
            }
        }

        if (empty($buttons)) {
            $this->sendMessage($chatId, "⚠️ Maaf, tidak ada produk tersedia di kategori ini.");
            return;
        }

        $this->sendMessage($chatId, "🛍️ <b>Daftar Produk:</b>", ['inline_keyboard' => $buttons]);
    }

    protected function sendStatus($chatId)
    {
        $pending = Transaction::where('chat_id', $chatId)->where('status', 'UNPAID')->latest()->first();

        if (!$pending) {
            $this->sendMessage($chatId, "✅ Tidak ada tagihan pending untuk saat ini.");
            return;
        }

        $text = "⏳ <b>Tagihan Pending:</b>\n\n";
        $text .= "Produk: <b>{$pending->product->name}</b>\n";
        $text .= "Total: <b>Rp " . number_format($pending->amount, 0, ',', '.') . "</b>\n";
        $text .= "Silakan segera selesaikan pembayaran Anda.";

        $this->sendMessage($chatId, $text);
    }

    protected function sendHelp($chatId)
    {
        $text = "❓ <b>Bantuan & Dukungan</b>\n\n";
        $text .= "Jika Anda mengalami kendala pembayaran atau akun tidak terkirim, silakan hubungi Admin:\n\n";
        $text .= "👤 Telegram: @AdminStore\n";
        $text .= "📱 WhatsApp: +628123456789\n\n";
        $text .= "<b>Daftar Perintah:</b>\n";
        $text .= "/start - Mulai Belanja\n";
        $text .= "/history - Lihat Akun yang Dibeli\n";
        $text .= "/status - Cek Tagihan Pending\n";
        $text .= "/help - Bantuan";

        $this->sendMessage($chatId, $text);
    }

    protected function sendHistory($chatId)
    {
        $transactions = Transaction::where('chat_id', $chatId)
            ->where('status', 'PAID')
            ->with(['product', 'digitalAsset'])
            ->latest()
            ->take(5)
            ->get();

        if ($transactions->isEmpty()) {
            $this->sendMessage($chatId, "📜 Anda belum memiliki riwayat pembelian.");
            return;
        }

        $text = "📜 <b>5 Pembelian Terakhir:</b>\n\n";
        foreach ($transactions as $tx) {
            $text .= "📦 <b>{$tx->product->name}</b>\n";
            $text .= "🔑 Akun: <code>" . ($tx->digitalAsset->data_detail ?? 'N/A') . "</code>\n";
            $text .= "----------------------------\n";
        }

        $this->sendMessage($chatId, $text);
    }

    protected function processOrder($chatId, $productId)
    {
        $product = Product::find($productId);
        if (!$product || $product->availableAssetsCount() <= 0) {
            $this->sendMessage($chatId, "❌ Stok habis atau produk tidak tersedia.");
            return;
        }

        $loadingMsg = $this->sendMessage($chatId, "⏳ Menyiapkan pesanan...");

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
                Http::post("{$this->apiUrl}/sendPhoto", [
                    'chat_id' => $chatId,
                    'photo' => $qrImageUrl,
                    'caption' => "✅ <b>PESANAN DIBUAT!</b>\n\nProduk: <b>{$product->name}</b>\nTotal: <b>Rp " . number_format($product->price, 0, ',', '.') . "</b>\n\nSilakan scan untuk membayar.",
                    'parse_mode' => 'HTML'
                ]);
            } else {
                $this->sendMessage($chatId, "✅ <b>PESANAN DIBUAT!</b>\n\nProduk: <b>{$product->name}</b>\n\nSilakan bayar di sini:", [
                    'inline_keyboard' => [[['text' => '💳 Bayar Sekarang', 'url' => $duitku['paymentUrl']]]]
                ]);
            }
        } else {
            $this->sendMessage($chatId, "❌ Gagal membuat pesanan.");
        }
    }

    protected function sendMessage($chatId, $text, $replyMarkup = null)
    {
        $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        $response = Http::post("{$this->apiUrl}/sendMessage", $payload);
        return $response->json();
    }
}
