<!DOCTYPE html>
<html>
<head>
    <title>Empire Financial Report - {{ $month }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #1e293b; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; font-size: 24px; }
        .stats-grid { width: 100%; margin-bottom: 30px; }
        .stats-card { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; width: 45%; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; color: #64748b; }
        .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
        .profit { color: #10b981; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Monthly Financial Report</h1>
        <p style="font-size: 12px; color: #64748b;">Period: {{ $month }}</p>
    </div>

    <table class="stats-grid">
        <tr>
            <td class="stats-card">
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Total Revenue</div>
                <div style="font-size: 18px; font-weight: bold;">Rp {{ number_format($totalRevenue) }}</div>
            </td>
            <td style="width: 10%;"></td>
            <td class="stats-card">
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Net Profit</div>
                <div style="font-size: 18px; font-weight: bold; color: #10b981;">Rp {{ number_format($totalProfit) }}</div>
            </td>
        </tr>
    </table>

    <h3>Top Selling Products</h3>
    <table class="table">
        <thead>
            <tr>
                <th>Product Name</th>
                <th style="text-align: center;">Qty Sold</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topProducts as $tp)
            <tr>
                <td>{{ $tp->product->name }}</td>
                <td style="text-align: center;">{{ $tp->total }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generated automatically by Empire Engine — {{ now()->toDateTimeString() }}
    </div>
</body>
</html>
