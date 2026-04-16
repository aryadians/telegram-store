<?php

namespace App\Http\Controllers;

use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XenditController extends Controller
{
    public static function createInvoice($product, $chatId)
    {
        $secretKey = env('XENDIT_SECRET_KEY');
        $externalId = 'INV-' . time() . '-' . rand(1000, 9999);

        $payload = [
            'external_id' => $externalId,
            'amount' => (int) $product->price,
            'description' => "Pembelian " . $product->name,
            'customer' => [
                'given_names' => 'Telegram User',
                'email' => 'user@telegram.com'
            ],
            'success_redirect_url' => 'https://t.me/your_bot_username',
            'failure_redirect_url' => 'https://t.me/your_bot_username',
            'currency' => 'IDR',
            'items' => [
                [
                    'name' => $product->name,
                    'quantity' => 1,
                    'price' => (int) $product->price
                ]
            ]
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($secretKey . ':')
        ])->post('https://api.xendit.co/v2/invoices', $payload);

        return $response->json();
    }

    public function handleWebhook(Request $request)
    {
        $callbackToken = $request->header('x-callback-token');
        
        if ($callbackToken !== env('XENDIT_CALLBACK_TOKEN')) {
            return response()->json(['message' => 'Invalid callback token'], 403);
        }

        $data = $request->all();
        $externalId = $data['external_id'];
        $status = $data['status'];

        if ($status === 'PAID' || $status === 'SETTLED') {
            $transaction = Transaction::where('reference', $externalId)->where('status', 'UNPAID')->first();

            if ($transaction) {
                $transaction->update(['status' => 'PAID']);

                // Auto-Delivery
                $asset = DigitalAsset::where('product_id', $transaction->product_id)
                    ->where('is_used', false)
                    ->first();

                if ($asset) {
                    $asset->update([
                        'is_used' => true,
                        'transaction_id' => $transaction->id
                    ]);

                    $this->sendToTelegram($transaction->chat_id, "<b>Pembayaran Berhasil!</b>\n\nProduk: {$transaction->product->name}\nDetail Akun:\n<code>{$asset->data_detail}</code>\n\nTerima kasih telah berbelanja!");
                } else {
                    $this->sendToTelegram($transaction->chat_id, "Pembayaran Berhasil, namun stok habis. Admin akan segera menghubungi Anda.");
                }
            }
        }

        return response()->json(['status' => 'OK']);
    }

    protected function sendToTelegram($chatId, $text)
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML'
        ]);
    }
}
