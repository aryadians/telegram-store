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
    public static function createTransaction($product, $chatId) { return self::requestDuitku($product->price, $product->name, 'INV-' . time(), 'DQ'); }
    public static function createDeposit($amount, $chatId) { return self::requestDuitku($amount, "Deposit Saldo", 'DEP-' . time(), 'DQ'); }

    private static function requestDuitku($amount, $name, $orderId, $method)
    {
        $merchantCode = env('DUITKU_MERCHANT_CODE');
        $apiKey = env('DUITKU_API_KEY');
        $baseUrl = (env('DUITKU_MODE') === 'sandbox') ? 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry' : 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';
        $signature = md5($merchantCode . $orderId . (int)$amount . $apiKey);

        $payload = [
            'merchantCode' => $merchantCode, 'paymentAmount' => (int)$amount, 'merchantOrderId' => $orderId,
            'productDetails' => $name, 'customerVaName' => 'User', 'email' => 'user@mail.com',
            'callbackUrl' => url('/api/duitku/webhook'), 'returnUrl' => 'https://t.me/zona_akun_premium_bot',
            'signature' => $signature, 'expiryPeriod' => 1440, 'paymentMethod' => $method
        ];

        $response = Http::post($baseUrl, $payload);
        $result = $response->json();
        $result['merchantOrderId'] = $orderId;
        return $result;
    }

    public function handleWebhook(Request $request)
    {
        $data = $request->all();
        $orderId = $data['merchantOrderId'] ?? '';
        $resultCode = $data['resultCode'] ?? '';
        
        if ($resultCode === '00') {
            if (str_starts_with($orderId, 'INV-')) {
                $transaction = Transaction::where('reference', $orderId)->where('status', 'UNPAID')->first();
                if ($transaction) {
                    $transaction->update(['status' => 'PAID']);
                    $asset = DigitalAsset::where('product_id', $transaction->product_id)->where('is_used', false)->first();
                    if ($asset) {
                        $asset->update(['is_used' => true, 'transaction_id' => $transaction->id]);
                        
                        $template = Setting::get('template_success', "✅ <b>PEMBAYARAN BERHASIL!</b>\n\nProduk: [PRODUCT_NAME]\nAkun: <code>[ACCOUNT_DETAILS]</code>");
                        $finalMessage = str_replace(['[PRODUCT_NAME]', '[ACCOUNT_DETAILS]'], [$transaction->product->name, $asset->data_detail], $template);
                        $this->sendToTelegram($transaction->chat_id, $finalMessage);

                        // RATING PROMPT
                        $ratingText = "⭐ <b>BANTU KAMI BERKEMBANG</b>\n\nBagaimana pengalaman belanja Anda? Silakan berikan rating untuk produk ini:";
                        $ratingBtns = [[
                            ['text' => '⭐ 1', 'callback_data' => "RATE_{$transaction->id}_1"],
                            ['text' => '⭐ 2', 'callback_data' => "RATE_{$transaction->id}_2"],
                            ['text' => '⭐ 3', 'callback_data' => "RATE_{$transaction->id}_3"],
                            ['text' => '⭐ 4', 'callback_data' => "RATE_{$transaction->id}_4"],
                            ['text' => '⭐ 5', 'callback_data' => "RATE_{$transaction->id}_5"],
                        ]];
                        $this->sendToTelegramWithButtons($transaction->chat_id, $ratingText, ['inline_keyboard' => $ratingBtns]);

                        // --- AUTO TESTIMONIAL CHANNEL ---
                        $user = TelegramUser::where('chat_id', $transaction->chat_id)->first();
                        $testiChannel = Setting::get('testi_channel_id'); // ID Channel Anda
                        if ($testiChannel) {
                            $testiMsg = "🛍️ <b>TESTIMONI BARU!</b>\n\n";
                            $testiMsg .= "👤 <b>User:</b> " . ($user->first_name ?? 'Pelanggan') . "\n";
                            $testiMsg .= "📦 <b>Produk:</b> " . $transaction->product->name . "\n";
                            $testiMsg .= "✅ <b>Status:</b> Sukses Terkirim Otomatis\n\n";
                            $testiMsg .= "Terima kasih sudah belanja di <b>Zona Akun Premium</b>! ⚡";
                            $this->sendToTelegram($testiChannel, $testiMsg);
                        }
                    }
                }
            } 
            elseif (str_starts_with($orderId, 'DEP-')) {
                $deposit = Deposit::where('reference', $orderId)->where('status', 'UNPAID')->first();
                if ($deposit) {
                    $deposit->update(['status' => 'PAID']);
                    $user = TelegramUser::where('chat_id', $deposit->chat_id)->first();
                    if ($user) $user->increment('balance', $deposit->amount);
                }
            }
        }
        return response('OK', 200);
    }

    protected function sendToTelegram($chatId, $text) {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML']);
    }

    protected function sendToTelegramWithButtons($chatId, $text, $replyMarkup) {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId, 
            'text' => $text, 
            'parse_mode' => 'HTML',
            'reply_markup' => json_encode($replyMarkup)
        ]);
    }
}
