<?php

namespace App\Http\Controllers;

use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuController extends Controller
{
    public static function createTransaction($product, $chatId)
    {
        $merchantCode = env('DUITKU_MERCHANT_CODE');
        $apiKey = env('DUITKU_API_KEY');
        
        $baseUrl = (env('DUITKU_MODE') === 'sandbox') 
            ? 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry' 
            : 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';

        $merchantOrderId = 'INV-' . time() . '-' . rand(100, 999);
        $paymentAmount = (int) $product->price;
        $signature = md5($merchantCode . $merchantOrderId . $paymentAmount . $apiKey);

        $payload = [
            'merchantCode' => $merchantCode,
            'paymentAmount' => $paymentAmount,
            'merchantOrderId' => $merchantOrderId,
            'productDetails' => $product->name,
            'customerVaName' => 'Telegram User',
            'email' => 'user@telegram.com',
            'callbackUrl' => url('/api/duitku/webhook'),
            'returnUrl' => 'https://t.me/your_bot_username',
            'signature' => $signature,
            'expiryPeriod' => 1440,
            'paymentMethod' => 'DQ' // Coba QRIS dulu
        ];

        $response = Http::post($baseUrl, $payload);
        $result = $response->json();

        // Jika QRIS Gagal, Coba gunakan metode VC (Checkout Page) sebagai backup
        if (!isset($result['qrString'])) {
            $payload['paymentMethod'] = 'VC';
            $payload['signature'] = md5($merchantCode . $merchantOrderId . $paymentAmount . $apiKey);
            $response = Http::post($baseUrl, $payload);
            $result = $response->json();
        }

        // Pastikan merchantOrderId selalu ada di dalam array hasil
        $result['merchantOrderId'] = $merchantOrderId;

        return $result;
    }

    public function handleWebhook(Request $request)
    {
        $data = $request->all();
        $merchantCode = $data['merchantCode'] ?? '';
        $amount = $data['amount'] ?? '';
        $merchantOrderId = $data['merchantOrderId'] ?? '';
        $signature = $data['signature'] ?? '';
        $resultCode = $data['resultCode'] ?? '';
        
        $apiKey = env('DUITKU_API_KEY');
        $expectedSignature = md5($merchantCode . $amount . $merchantOrderId . $apiKey);

        if ($signature !== $expectedSignature) {
            return response('Invalid Signature', 400);
        }

        if ($resultCode === '00') {
            $transaction = Transaction::where('reference', $merchantOrderId)->where('status', 'UNPAID')->first();

            if ($transaction) {
                $transaction->update(['status' => 'PAID']);

                $asset = DigitalAsset::where('product_id', $transaction->product_id)
                    ->where('is_used', false)
                    ->first();

                if ($asset) {
                    $asset->update([
                        'is_used' => true,
                        'transaction_id' => $transaction->id
                    ]);

                    $this->sendToTelegram($transaction->chat_id, "✅ <b>PEMBAYARAN BERHASIL!</b>\n\nProduk: <b>{$transaction->product->name}</b>\n\nDetail Akun:\n<code>{$asset->data_detail}</code>\n\nTerima kasih telah berlangganan!");

                    // NOTIFIKASI STOK MENIPIS KE ADMIN
                    $remaining = DigitalAsset::where('product_id', $transaction->product_id)->where('is_used', false)->count();
                    if ($remaining < 5) {
                        $adminChatId = 'YOUR_ADMIN_CHAT_ID'; // Ganti dengan Chat ID Anda
                        $this->sendToTelegram($adminChatId, "⚠️ <b>PERINGATAN STOK!</b>\n\nProduk: <b>{$transaction->product->name}</b>\nSisa Stok: <b>{$remaining}</b>\n\nMohon segera isi ulang stok akun!");
                    }
                } else {
                    $this->sendToTelegram($transaction->chat_id, "✅ Pembayaran Berhasil, namun stok habis. Admin akan menghubungi Anda.");
                }
            }
        }

        return response('OK', 200);
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
