<?php

namespace App\Services;

use Illuminate\Support\Facades\Response;

class CsvExporter
{
    public function download($collection, $filename)
    {
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($collection) {
            $file = fopen('php://output', 'w');
            
            // Header Baris
            fputcsv($file, ['ID', 'Reference', 'Chat ID', 'Product', 'Amount', 'Status', 'Date']);

            foreach ($collection as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->reference,
                    $row->chat_id,
                    $row->product->name,
                    $row->amount,
                    $row->status,
                    $row->created_at
                ]);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
