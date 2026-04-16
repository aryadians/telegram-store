<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. ACTIVITY LOGS
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_name')->nullable(); // Admin name
            $table->string('action'); // e.g. "Changed price of Netflix"
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        // 2. USER TIERING
        Schema::table('telegram_users', function (Blueprint $table) {
            $table->enum('tier', ['REGULAR', 'VIP'])->default('REGULAR')->after('balance');
            $table->decimal('total_spent', 15, 2)->default(0)->after('tier');
        });

        // 3. PAYMENT TYPE
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('payment_type', ['AUTO', 'MANUAL'])->default('AUTO')->after('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::table('telegram_users', function (Blueprint $table) { $table->dropColumn(['tier', 'total_spent']); });
        Schema::table('transactions', function (Blueprint $table) { $table->dropColumn('payment_type'); });
    }
};
