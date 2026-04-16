import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { 
    Download, Users, TrendingUp, Clock, AlertCircle, 
    ShoppingCart, Sparkles, Megaphone, Database, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, products = [], recentTransactions = [], stats = {}, salesChart = [], topProducts = [] }) {
    
    const chartData = (salesChart || []).map(item => ({
        name: item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A',
        total: Number(item.total || 0)
    }));

    const topProductsData = (topProducts || []).map(item => ({
        name: item.product?.name || 'Deleted Product',
        revenue: Number(item.total_revenue || 0)
    }));

    const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            Dashboard <Sparkles className="w-4 h-4 text-indigo-500" />
                        </h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Business Intelligence</p>
                    </div>
                    <a 
                        href={route('admin.transactions.export')} 
                        className="btn-primary !py-2 !px-4"
                    >
                        <Download className="w-3.5 h-3.5" /> Export Report
                    </a>
                </div>
            }
        >
            <Head title="Dashboard" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                
                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <QuickActionCard title="Broadcast" desc="Reach subscribers" href={route('admin.broadcast')} icon={Megaphone} color="text-indigo-600 bg-indigo-50" />
                    <QuickActionCard title="Inject Stock" desc="Refill database" href={route('admin.stock-opname')} icon={Database} color="text-slate-600 bg-slate-100" />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Revenue" value={`Rp${Number(stats.total_revenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" variant={itemVariants} />
                    <StatCard label="Avg. Order" value={`Rp${Number(stats.aov || 0).toLocaleString()}`} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" variant={itemVariants} />
                    <StatCard label="Total Users" value={stats.total_users || 0} icon={Users} color="text-emerald-600" bg="bg-emerald-50" subValue={`+${stats.new_users_today || 0} today`} variant={itemVariants} />
                    <StatCard label="Avg Rating" value={`⭐ ${Number(stats.avg_rating || 0).toFixed(1)}`} icon={Sparkles} color="text-amber-600" bg="bg-amber-50" variant={itemVariants} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={itemVariants} className="lg:col-span-2 premium-card">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Revenue Analysis (7D)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                                    <Tooltip contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                                    <Area type="monotone" dataKey="total" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="premium-card">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Best Sellers</h3>
                        <div className="h-64">
                            {topProductsData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topProductsData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 9, fontWeight: '700', fill: '#64748B'}} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                                            {topProductsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 text-xs italic uppercase font-bold tracking-widest">No Sales Data</div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                    <motion.div variants={itemVariants} className="premium-card">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4 text-rose-500" /> Stock Warning
                        </h3>
                        <div className="space-y-3">
                            {products.filter(p => p.total_stock < 5).map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate uppercase">{p.name}</div>
                                        <div className="text-[9px] text-slate-400 font-bold">{p.code}</div>
                                    </div>
                                    <div className="text-sm font-black text-rose-600 leading-none">{p.total_stock}</div>
                                </div>
                            ))}
                            {products.filter(p => p.total_stock < 5).length === 0 && (
                                <div className="py-6 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">Stock is healthy</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="premium-card !p-0 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider leading-none">Recent Activity</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-50">
                                    {recentTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                                            <td className="py-4 px-6">
                                                <div className="text-xs font-bold text-slate-700 uppercase truncate">{tx.product?.name || 'Unknown'}</div>
                                                <div className="text-[9px] font-mono text-slate-400">{tx.reference}</div>
                                            </td>
                                            <td className="py-4 px-6 text-xs font-bold text-slate-900 text-right">Rp{Number(tx.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {recentTransactions.length === 0 && (
                                        <tr><td className="py-10 text-center text-slate-300 text-xs italic uppercase tracking-widest font-black">No transactions yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color, bg, variant, subValue }) {
    return (
        <motion.div variants={variant} className="premium-card !p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</span>
            </div>
            <div className="text-base font-bold text-slate-900 tracking-tight">{value}</div>
            {subValue && <div className="text-[9px] text-emerald-500 font-bold mt-1 uppercase tracking-tighter">{subValue}</div>}
        </motion.div>
    );
}

function QuickActionCard({ title, desc, href, icon: Icon, color }) {
    return (
        <Link href={href} className={`flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm group`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}><Icon className="w-5 h-5" /></div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-none mb-1">{title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
                </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </Link>
    );
}
