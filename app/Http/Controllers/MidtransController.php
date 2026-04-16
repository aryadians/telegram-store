<?php

namespace App\Http\Controllers;

use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    public static function createTransactionWithOrderId($product, $chatId, $orderId)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        $baseUrl = $isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions' 
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $amount = (int) $product->price;

        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $amount,
            ],
            'item_details' => [
                [
                    'id' => $product->id,
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => $product->name,
                ]
            ],
            'customer_details' => [
                'first_name' => 'Telegram User',
                'email' => 'user@telegram.com'
            ],
            'enabled_payments' => ['qris', 'bank_transfer', 'gopay', 'shopeepay', 'other_va'],
            'expiry' => [
                'unit' => 'hour',
                'duration' => 24
            ]
        ];

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Authorization' => 'Basic ' . base64_encode($serverKey . ':')
        ])->post($baseUrl, $payload);

        return $response->json();
    }

    public function handleWebhook(Request $request)
    {
        $data = $request->all();
        $orderId = $data['order_id'];
        $statusCode = $data['status_code'];
        $grossAmount = $data['gross_amount'];
        $signatureKey = $data['signature_key'];
        
        $serverKey = env('MIDTRANS_SERVER_KEY');

        // Validasi Signature
        $hash = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        
        if ($signatureKey !== $hash) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $data['transaction_status'];
        $fraudStatus = $data['fraud_status'] ?? '';

        if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
            if ($fraudStatus === 'accept' || $transactionStatus === 'settlement') {
                $transaction = Transaction::where('reference', $orderId)->where('status', 'UNPAID')->first();

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

                        $this->sendToTelegram($transaction->chat_id, "✅ <b>Pembayaran Berhasil!</b>\n\nProduk: <b>{$transaction->product->name}</b>\n\nDetail Akun:\n<code>{$asset->data_detail}</code>\n\nTerima kasih telah berbelanja!");
                    } else {
                        $this->sendToTelegram($transaction->chat_id, "✅ Pembayaran Berhasil, namun stok habis. Admin akan segera menghubungi Anda.");
                    }
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
