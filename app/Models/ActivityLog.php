<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_name', 'action', 'payload'];
    protected $casts = ['payload' => 'array'];

    public static function log($action, $payload = null)
    {
        return self::create([
            'user_name' => auth()->user() ? auth()->user()->name : 'System',
            'action' => $action,
            'payload' => $payload
        ]);
    }
}
