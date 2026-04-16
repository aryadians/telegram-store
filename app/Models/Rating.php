<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = ['transaction_id', 'stars', 'comment'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
