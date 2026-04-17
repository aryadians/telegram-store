<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestockNotification extends Model
{
    protected $fillable = ['chat_id', 'product_id', 'is_notified'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
