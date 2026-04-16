import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Clock, AlertCircle, ShoppingCart, Download, DollarSign } from 'lucide-react';

export default function Dashboard({ auth, products = [], recentTransactions = [], stats = {}, salesChart = [], topProducts = [] }) {
    
    // Safety check for chart data
    const chartData = (salesChart || []).map(item => ({
        name: item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A',
        revenue: Number(item.revenue || 0),
    }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Executive Dashboard</h2>
                    <a href={route('admin.transactions.export')} className="btn-primary !py-2 !px-4"><Download className="w-4 h-4" /> Export</a>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Revenue" value={`Rp${Number(stats.total_revenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
                    <StatCard label="Net Profit" value={`Rp${Number(stats.total_profit || 0).toLocaleString()}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatCard label="Total Users" value={stats.total_users || 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
                    <StatCard label="Avg. Order" value={`Rp${Number(stats.aov || 0).toLocaleString()}`} icon={ShoppingCart} color="text-indigo-600" bg="bg-indigo-50" />
                </div>

                {/* Chart Section */}
                <div className="premium-card">
                    <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-widest">Revenue Analytics (7D)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="premium-card !p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-base font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
    );
}
