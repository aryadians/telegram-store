<?php

namespace App\Http\Controllers;

use App\Models\DigitalAsset;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TelegramUser;
use App\Models\Setting;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuController extends Controller
{
    public static function createTransaction($product, $chatId)
    {
        return self::requestDuitku($product->price, $product->name, 'INV-' . time() . '-' . rand(100, 999), 'DQ');
    }

    public static function createDeposit($amount, $chatId)
    {
        return self::requestDuitku($amount, "Deposit Saldo Bot", 'DEP-' . time() . '-' . rand(100, 999), 'DQ');
    }

    private static function requestDuitku($amount, $name, $orderId, $method)
    {
        $merchantCode = env('DUITKU_MERCHANT_CODE');
        $apiKey = env('DUITKU_API_KEY');
        $baseUrl = (env('DUITKU_MODE') === 'sandbox') 
            ? 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry' 
            : 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';

        $signature = md5($merchantCode . $orderId . (int)$amount . $apiKey);

        $payload = [
            'merchantCode' => $merchantCode,
            'paymentAmount' => (int)$amount,
            'merchantOrderId' => $orderId,
            'productDetails' => $name,
            'customerVaName' => 'Telegram User',
            'email' => 'user@telegram.com',
            'callbackUrl' => url('/api/duitku/webhook'),
            'returnUrl' => 'https://t.me/zona_akun_premium_bot',
            'signature' => $signature,
            'expiryPeriod' => 1440,
            'paymentMethod' => $method
        ];

        try {
            $response = Http::timeout(10)->post($baseUrl, $payload);
            $result = $response->json();
            if (!isset($result['qrString']) && !isset($result['paymentUrl'])) {
                $payload['paymentMethod'] = 'VC';
                $payload['signature'] = md5($merchantCode . $orderId . (int)$amount . $apiKey);
                $response = Http::post($baseUrl, $payload);
                $result = $response->json();
            }
            $result['merchantOrderId'] = $orderId;
            return $result;
        } catch (\Exception $e) {
            return ['qrString' => 'SIMULATED_QR', 'merchantOrderId' => $orderId, 'is_simulated' => true];
        }
    }

    public function handleWebhook(Request $request)
    {
        $data = $request->all();
        $orderId = $data['merchantOrderId'] ?? '';
        $resultCode = $data['resultCode'] ?? '';
        $apiKey = env('DUITKU_API_KEY');
        
        $expectedSignature = md5(($data['merchantCode'] ?? '') . ($data['amount'] ?? '') . $orderId . $apiKey);
        if (($data['signature'] ?? '') !== $expectedSignature) return response('Invalid Signature', 400);

        if ($resultCode === '00') {
            if (str_starts_with($orderId, 'INV-')) {
                $transaction = Transaction::where('reference', $orderId)->where('status', 'UNPAID')->first();
                if ($transaction) {
                    $transaction->update(['status' => 'PAID']);
                    $asset = DigitalAsset::where('product_id', $transaction->product_id)->where('is_used', false)->first();
                    if ($asset) {
                        $asset->update(['is_used' => true, 'transaction_id' => $transaction->id]);

                        // REAL-TIME: Fetch Success Template from Database
                        $template = Setting::get('template_success', "✅ <b>PEMBAYARAN BERHASIL!</b>\n\nProduk: <b>[PRODUCT_NAME]</b>\nDetail Akun:\n<code>[ACCOUNT_DETAILS]</code>");
                        
                        // Replace Placeholders
                        $finalMessage = str_replace(
                            ['[PRODUCT_NAME]', '[ACCOUNT_DETAILS]'],
                            [$transaction->product->name, $asset->data_detail],
                            $template
                        );

                        $this->sendToTelegram($transaction->chat_id, $finalMessage);
                        
                        // Referral logic stays same...
                        $user = TelegramUser::where('chat_id', $transaction->chat_id)->first();
                        if ($user && $user->referred_by) {
                            $referrer = TelegramUser::where('chat_id', $user->referred_by)->first();
                            if ($referrer) {
                                $bonus = $transaction->amount * ((float)Setting::get('referral_bonus', 5) / 100);
                                $referrer->increment('balance', $bonus);
                                $this->sendToTelegram($referrer->chat_id, "🎊 <b>Bonus Referral!</b>\nTeman belanja, Anda dapat <b>Rp " . number_format($bonus) . "</b>.");
                            }
                        }
                    }
                }
            } 
            elseif (str_starts_with($orderId, 'DEP-')) {
                $deposit = Deposit::where('reference', $orderId)->where('status', 'UNPAID')->first();
                if ($deposit) {
                    $deposit->update(['status' => 'PAID']);
                    $user = TelegramUser::where('chat_id', $deposit->chat_id)->first();
                    if ($user) {
                        $user->increment('balance', $deposit->amount);
                        $this->sendToTelegram($deposit->chat_id, "💰 <b>DEPOSIT BERHASIL!</b>\n\nSaldo Anda telah bertambah <b>Rp " . number_format($deposit->amount) . "</b>.");
                    }
                }
            }
        }
        return response('OK', 200);
    }

    protected function sendToTelegram($chatId, $text)
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML']);
    }
}
