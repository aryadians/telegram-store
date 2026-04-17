<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\DuitkuController;

// TELEGRAM WEBHOOK (With Apex Secret Token)
Route::post('/telegram/webhook/' . env('TELEGRAM_BOT_TOKEN'), [TelegramController::class, 'webhook']);

// DUITKU WEBHOOK
Route::post('/duitku/webhook', [DuitkuController::class, 'handleWebhook']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
