<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. CLICKSTREAM TRACKING
        Schema::create('user_interactions', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id');
            $table->string('action'); // e.g. "VIEW_COFFEE_CAT", "CLICK_HELP"
            $table->string('source')->nullable(); // Instagram, WA, etc.
            $table->timestamps();
        });

        // 2. BEHAVIORAL SEGMENTATION
        Schema::table('telegram_users', function (Blueprint $table) {
            $table->string('behavior_tag')->default('NEWBIE')->after('tier'); // WHALE, HUNTER, REF_KING
            $table->string('acquisition_source')->nullable()->after('behavior_tag');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_interactions');
        Schema::table('telegram_users', function (Blueprint $table) {
            $table->dropColumn(['behavior_tag', 'acquisition_source']);
        });
    }
};
