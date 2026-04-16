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

export default function Dashboard({ auth, products, recentTransactions, stats, salesChart, topProducts }) {
    
    const chartData = salesChart.map(item => ({
        name: new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        total: Number(item.total)
    }));

    const topProductsData = topProducts.map(item => ({
        name: item.product.name,
        revenue: Number(item.total_revenue)
    }));

    const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-6 px-4 sm:px-0">
                    <div className="space-y-1">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Executive Overview <Sparkles className="hidden sm:block w-6 h-6 text-indigo-500 animate-pulse" />
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">Insights & business intelligence</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a 
                            href={route('admin.transactions.export')} 
                            className="group flex items-center justify-center gap-3 bg-[#0F172A] text-white px-8 py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 w-full sm:w-auto"
                        >
                            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Full Report
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
                
                {/* NEW: QUICK ACTIONS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickActionCard 
                        title="Marketing Blast" 
                        desc="Reach all customers with promo" 
                        href={route('admin.broadcast')} 
                        icon={Megaphone} 
                        color="bg-indigo-600"
                    />
                    <QuickActionCard 
                        title="Stock Injection" 
                        desc="Refill your digital database" 
                        href={route('admin.stock-opname')} 
                        icon={Database} 
                        color="bg-slate-900"
                    />
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Revenue" value={`Rp ${Number(stats.total_revenue).toLocaleString()}`} icon={TrendingUp} color="indigo" variant={itemVariants} />
                    <StatCard label="AOV (Avg. Order)" value={`Rp ${Number(stats.aov).toLocaleString()}`} icon={ShoppingCart} color="blue" variant={itemVariants} />
                    <StatCard label="Total Users" value={stats.total_users} icon={Users} color="emerald" variant={itemVariants} subValue={`+${stats.new_users_today} today`} />
                    <StatCard label="Pending" value={stats.pending_orders} icon={Clock} color="amber" variant={itemVariants} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* CHART: Revenue Stream */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-8">Revenue Stream Analysis</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '800', fill: '#94A3B8'}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '800', fill: '#94A3B8'}} />
                                    <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}} />
                                    <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* CHART: Top Products (NEW) */}
                    <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-8">Best Selling</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 10, fontWeight: '800', fill: '#64748B'}} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="revenue" radius={[0, 10, 10, 0]}>
                                        {topProductsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
                    {/* INVENTORY & RECENT ACTIVITY */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                            <AlertCircle className="text-rose-500 w-5 h-5" /> Low Stock
                        </h3>
                        <div className="space-y-4">
                            {products.filter(p => p.total_stock < 5).map(p => (
                                <div key={p.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-rose-50 transition-all">
                                    <div>
                                        <div className="font-black text-slate-800 text-sm group-hover:text-rose-900 uppercase">{p.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.code}</div>
                                    </div>
                                    <div className="text-2xl font-black text-rose-600">{p.total_stock}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-8">Recent Flow</h3>
                        <div className="space-y-4 text-sm font-bold text-slate-600">
                            {recentTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-slate-50">
                                    <span>{tx.product.name}</span>
                                    <span className="text-slate-900 font-black">Rp {Number(tx.amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color, variant, subValue }) {
    const colors = {
        indigo: 'bg-indigo-500 text-indigo-600',
        blue: 'bg-blue-500 text-blue-600',
        amber: 'bg-amber-500 text-amber-600',
        emerald: 'bg-emerald-500 text-emerald-600',
    };

    return (
        <motion.div variants={variant} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:-translate-y-1 transition-all duration-500">
            <div className={`p-5 rounded-[1.5rem] ${colors[color]} bg-opacity-10 shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="min-w-0">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 truncate">{label}</div>
                <div className="text-2xl font-black text-slate-900 leading-none tracking-tighter truncate">{value}</div>
                {subValue && <div className="text-[10px] text-emerald-500 font-black mt-1 uppercase tracking-widest">{subValue}</div>}
            </div>
        </motion.div>
    );
}

function QuickActionCard({ title, desc, href, icon: Icon, color }) {
    return (
        <Link href={href} className={`${color} p-8 rounded-[2.5rem] text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-between`}>
            <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 shadow-inner group-hover:rotate-6 transition-all duration-500">
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-xl font-black tracking-tight">{title}</h4>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{desc}</p>
                </div>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
                <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
        </Link>
    );
}
