<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // GIFT SYSTEM SUPPORT
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'recipient_chat_id')) {
                $table->string('recipient_chat_id')->nullable()->after('chat_id');
            }
            if (!Schema::hasColumn('transactions', 'is_gift')) {
                $table->boolean('is_gift')->default(false)->after('recipient_chat_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['recipient_chat_id', 'is_gift']);
        });
    }
};
