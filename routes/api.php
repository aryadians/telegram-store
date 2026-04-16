<?php

use App\Http\Controllers\TelegramController;
use App\Http\Controllers\DuitkuController;
use Illuminate\Support\Facades\Route;

Route::post('/telegram/webhook', [TelegramController::class, 'webhook']);
Route::post('/duitku/webhook', [DuitkuController::class, 'handleWebhook']);
