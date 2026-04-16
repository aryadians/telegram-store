<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; margin-bottom: 10px; border-radius: 15px; }
        .title { font-size: 20px; font-weight: bold; text-transform: uppercase; color: #4F46E5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #F8FAFC; color: #64748B; text-align: left; padding: 10px; border-bottom: 2px solid #E2E8F0; font-size: 10px; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #F1F5F9; }
        .status-paid { color: #10B981; font-weight: bold; }
        .status-pending { color: #F59E0B; font-weight: bold; }
        .footer { margin-top: 50px; text-align: right; font-size: 10px; color: #94A3B8; }
    </style>
</head>
<body>
    <div className="header">
        <img src="{{ $logoBase64 }}" className="logo">
        <div className="title">Zona Akun Premium</div>
        <div style="margin-top: 5px; color: #94A3B8;">Transaction Report - {{ now()->format('d M Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Reference</th>
                <th>Product</th>
                <th>Amount</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $tx)
            <tr>
                <td style="font-family: monospace;">{{ $tx->reference }}</td>
                <td><b>{{ $tx->product->name }}</b></td>
                <td>Rp {{ number_format($tx->amount) }}</td>
                <td>{{ $tx->chat_id }}</td>
                <td class="{{ $tx->status == 'PAID' ? 'status-paid' : 'status-pending' }}">{{ $tx->status }}</td>
                <td>{{ $tx->created_at->format('d/m/Y H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div className="footer">
        Generated automatically by StoreSync System &bull; {{ now()->year }}
    </div>
</body>
</html>
