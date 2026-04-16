<?php

namespace App\Http\Controllers;

use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TripayController extends Controller
{
    public static function createTransaction($product, $chatId)
    {
        $apiKey = env('TRIPAY_API_KEY');
        $privateKey = env('TRIPAY_PRIVATE_KEY');
        $merchantCode = env('TRIPAY_MERCHANT_CODE');
        $mode = env('TRIPAY_MODE');

        $apiUrl = ($mode === 'sandbox') 
            ? 'https://tripay.co.id/api-sandbox/transaction/create' 
            : 'https://tripay.co.id/api/transaction/create';

        $merchantRef = 'TRX-' . time() . '-' . rand(1000, 9999);
        $amount = $product->price;

        $signature = hash_hmac('sha256', $merchantCode . $merchantRef . $amount, $privateKey);

        $payload = [
            'method'         => 'QRIS2',
            'merchant_ref'   => $merchantRef,
            'amount'         => $amount,
            'customer_name'  => 'Telegram User',
            'customer_email' => 'user@telegram.com',
            'order_items'    => [
                [
                    'name'     => $product->name,
                    'price'    => $amount,
                    'quantity' => 1,
                ]
            ],
            'callback_url'   => url('/api/tripay/webhook'),
            'return_url'     => 'https://t.me/your_bot_username',
            'expired_time'   => (time() + (24 * 60 * 60)), // 24 Hours
            'signature'      => $signature
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey
        ])->post($apiUrl, $payload);

        return $response->json();
    }

    public function handleWebhook(Request $request)
    {
        $callbackSignature = $request->header('X-Callback-Signature');
        $json = $request->getContent();
        $signature = hash_hmac('sha256', $json, env('TRIPAY_PRIVATE_KEY'));

        if ($signature !== $callbackSignature) {
            return response()->json(['success' => false, 'message' => 'Invalid signature']);
        }

        $data = json_decode($json);
        $reference = $data->reference;
        $status = $data->status;

        if ($status === 'PAID') {
            $transaction = Transaction::where('reference', $reference)->where('status', 'UNPAID')->first();

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

                    $this->sendToTelegram($transaction->chat_id, "Pembayaran Berhasil!\n\nProduk: {$transaction->product->name}\nDetail Akun:\n<code>{$asset->data_detail}</code>");
                } else {
                    $this->sendToTelegram($transaction->chat_id, "Pembayaran Berhasil, namun stok habis. Admin akan segera menghubungi Anda.");
                }
            }
        }

        return response()->json(['success' => true]);
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
