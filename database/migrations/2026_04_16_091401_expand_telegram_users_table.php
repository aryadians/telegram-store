<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('telegram_users', function (Blueprint $table) {
            $table->decimal('balance', 15, 2)->default(0)->after('first_name');
            $table->string('referral_code')->unique()->nullable()->after('balance');
            $table->string('referred_by')->nullable()->after('referral_code');
        });
    }

    public function down(): void
    {
        Schema::table('telegram_users', function (Blueprint $table) {
            $table->dropColumn(['balance', 'referral_code', 'referred_by']);
        });
    }
};
