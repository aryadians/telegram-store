<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInteraction extends Model
{
    protected $fillable = ['chat_id', 'action', 'source'];

    public static function log($chatId, $action)
    {
        return self::create([
            'chat_id' => $chatId,
            'action' => $action
        ]);
    }
}
