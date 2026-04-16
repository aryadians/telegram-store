import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Download, Users, TrendingUp, Clock, AlertCircle, ShoppingCart, Sparkles, Megaphone, Database, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, products, recentTransactions, stats, salesChart, topProducts }) {
    const chartData = salesChart.map(item => ({
        name: new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        total: Number(item.total)
    }));

    const topProductsData = topProducts.map(item => ({
        name: item.product.name,
        revenue: Number(item.total_revenue)
    }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            Dashboard <Sparkles className="w-4 h-4 text-indigo-500" />
                        </h2>
                        <p className="text-slate-400 text-xs font-medium">Monitoring your automated business</p>
                    </div>
                    <a href={route('admin.transactions.export')} className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all">
                        <Download className="w-3.5 h-3.5" /> Export Report
                    </a>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <QuickActionCard title="Broadcast" desc="Send promo to users" href={route('admin.broadcast')} icon={Megaphone} color="text-indigo-600 bg-indigo-50" />
                    <QuickActionCard title="Stock" desc="Inject account data" href={route('admin.stock-opname')} icon={Database} color="text-slate-600 bg-slate-100" />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Revenue" value={`Rp${Number(stats.total_revenue).toLocaleString()}`} icon={TrendingUp} color="text-indigo-600" />
                    <StatCard label="Orders" value={stats.total_orders} icon={ShoppingCart} color="text-blue-600" />
                    <StatCard label="Customers" value={stats.total_users} icon={Users} color="text-emerald-600" />
                    <StatCard label="Pending" value={stats.pending_orders} icon={Clock} color="text-amber-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CHART */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-700 mb-6">Revenue Analysis</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                                    <Tooltip contentStyle={{borderRadius: '0.75rem', border: '1px solid #E2E8F0', boxShadow: 'none'}} />
                                    <Area type="monotone" dataKey="total" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* TOP PRODUCTS */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-700 mb-6">Top Selling</h3>
                        <div className="space-y-4">
                            {topProductsData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">{item.name}</span>
                                    <span className="text-xs font-bold text-slate-900">Rp{item.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className={`${color} opacity-80`}><Icon className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
    );
}

function QuickActionCard({ title, desc, href, icon: Icon, color }) {
    return (
        <Link href={href} className={`flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm group`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
                </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </Link>
    );
}
