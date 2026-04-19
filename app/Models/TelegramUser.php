<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramUser extends Model
{
    protected $fillable = ['chat_id', 'username', 'first_name', 'balance', 'referral_code', 'referred_by', 'tier', 'total_spent', 'behavior_tag', 'acquisition_source'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'chat_id', 'chat_id');
    }

    public function updateBehaviorTag()
    {
        $spent = (float) $this->total_spent;
        $refs = self::where('referred_by', $this->chat_id)->count();
        
        $tag = 'NEWBIE';
        if ($spent >= 1000000) $tag = 'WHALE';
        elseif ($refs >= 10) $tag = 'REF_KING';
        elseif ($spent >= 250000) $tag = 'LOYAL';

        $this->update(['behavior_tag' => $tag]);
    }
}
