<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['category_id', 'name', 'code', 'price', 'cost_price', 'is_active'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function digitalAssets(): HasMany
    {
        return $this->hasMany(DigitalAsset::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function availableAssetsCount(): int
    {
        return $this->digitalAssets()->where('is_used', false)->count();
    }
}
