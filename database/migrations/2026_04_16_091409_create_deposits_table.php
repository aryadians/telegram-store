<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('chat_id');
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['UNPAID', 'PAID', 'FAILED'])->default('UNPAID');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
