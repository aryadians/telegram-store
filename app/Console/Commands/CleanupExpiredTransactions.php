<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;

class CleanupExpiredTransactions extends Command
{
    protected $signature = 'transactions:cleanup';
    protected $description = 'Mark unpaid transactions older than 24 hours as FAILED';

    public function handle()
    {
        $expiredCount = Transaction::where('status', 'UNPAID')
            ->where('created_at', '<=', now()->subHours(24))
            ->update(['status' => 'FAILED']);

        $this->info("Successfully expired {$expiredCount} transactions.");
    }
}
