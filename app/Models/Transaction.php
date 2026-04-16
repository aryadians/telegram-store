<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    protected $fillable = ['reference', 'chat_id', 'product_id', 'amount', 'status', 'payment_type'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function digitalAsset(): HasOne
    {
        return $this->hasOne(DigitalAsset::class);
    }
}
