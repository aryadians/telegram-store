<?php

namespace App\Http\Controllers;

use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PlinkController extends Controller
{
    public static function createTransaction($product, $chatId)
    {
        $merchantId = env('PLINK_MERCHANT_ID');
        $secretKey = env('PLINK_SECRET_KEY');
        $baseUrl = 'https://api.plink.id/v1';

        $merchantRef = 'INV-' . time() . '-' . rand(100, 999);
        $amount = (int) $product->price;

        // Generate Signature (Asumsi Plink menggunakan MerchantID + Ref + Amount + Secret)
        // Silakan sesuaikan dengan dokumentasi Plink terbaru jika berbeda
        $signature = hash('sha256', $merchantId . $merchantRef . $amount . $secretKey);

        $payload = [
            'merchant_id'   => $merchantId,
            'merchant_ref'  => $merchantRef,
            'amount'        => $amount,
            'customer_name' => 'Telegram User',
            'customer_email'=> 'user@telegram.com',
            'product_name'  => $product->name,
            'callback_url'  => url('/api/plink/webhook'),
            'return_url'    => 'https://t.me/your_bot_username',
            'signature'     => $signature
        ];

        $response = Http::post($baseUrl . '/checkout', $payload);

        return $response->json();
    }

    public function handleWebhook(Request $request)
    {
        $data = $request->all();
        Log::info('Plink Webhook:', $data);

        $merchantRef = $data['merchant_ref'] ?? '';
        $status = $data['status'] ?? ''; // Asumsi status: SUCCESS / PAID
        $signature = $data['signature'] ?? '';

        // Validasi Signature Callback
        $secretKey = env('PLINK_SECRET_KEY');
        $expectedSignature = hash('sha256', $data['merchant_id'] . $merchantRef . $data['amount'] . $secretKey);

        if ($signature !== $expectedSignature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        if ($status === 'SUCCESS' || $status === 'PAID') {
            $transaction = Transaction::where('reference', $merchantRef)->where('status', 'UNPAID')->first();

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

                    $this->sendToTelegram($transaction->chat_id, "✅ <b>Pembayaran Berhasil!</b>\n\nProduk: <b>{$transaction->product->name}</b>\nDetail Akun:\n<code>{$asset->data_detail}</code>\n\nTerima kasih!");
                } else {
                    $this->sendToTelegram($transaction->chat_id, "✅ Pembayaran Berhasil, namun stok habis. Admin akan segera menghubungi Anda.");
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
