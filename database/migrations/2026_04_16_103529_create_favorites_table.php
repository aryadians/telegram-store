<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('restock_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('restock_notifications');
        Schema::dropIfExists('favorites');
    }
};
