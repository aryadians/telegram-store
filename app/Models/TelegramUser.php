<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramUser extends Model
{
    protected $fillable = ['chat_id', 'username', 'first_name', 'balance', 'referral_code', 'referred_by', 'tier', 'total_spent'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'chat_id', 'chat_id');
    }
}
