<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    protected $fillable = ['reference', 'chat_id', 'amount', 'status'];
}
