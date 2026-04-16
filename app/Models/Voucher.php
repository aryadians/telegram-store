<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = ['code', 'type', 'value', 'limit', 'used', 'is_active'];

    public function isValid(): bool
    {
        return $this->is_active && ($this->limit === 0 || $this->used < $this->limit);
    }

    public function calculateDiscount($amount): float
    {
        if ($this->type === 'fixed') {
            return min($this->value, $amount);
        }
        return $amount * ($this->value / 100);
    }
}
