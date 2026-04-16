import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, TrendingUp, Clock, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, products, recentTransactions, stats, salesChart }) {
    
    const chartData = salesChart.map(item => ({
        name: new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        total: Number(item.total)
    }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Executive Overview</h2>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Real-time store performance</p>
                    </div>
                    <a 
                        href={route('admin.transactions.export')} 
                        className="group flex items-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Export Analytics
                    </a>
                </div>
            }
        >
            <Head title="Dashboard" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="py-12"
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <StatCard label="Total Revenue" value={`Rp ${Number(stats.total_revenue).toLocaleString()}`} icon={TrendingUp} color="indigo" variant={itemVariants} />
                        <StatCard label="Success Orders" value={stats.total_orders} icon={ShoppingCart} color="blue" variant={itemVariants} />
                        <StatCard label="Pending" value={stats.pending_orders} icon={Clock} color="amber" variant={itemVariants} />
                        <StatCard label="Customers" value={stats.total_users} icon={Users} color="emerald" variant={itemVariants} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        {/* Chart */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-800 mb-8">Revenue Stream</h3>
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
                                        <Tooltip 
                                            contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem'}}
                                            itemStyle={{fontWeight: '800', color: '#4F46E5'}}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Critical Stock */}
                        <motion.div variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-gray-800">Inventory Alert</h3>
                                <div className="p-2 bg-red-50 rounded-xl"><AlertCircle className="text-red-500 w-5 h-5" /></div>
                            </div>
                            <div className="space-y-4">
                                {products.filter(p => p.total_stock < 5).map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-red-50 hover:border-red-100 transition-all">
                                        <div>
                                            <div className="font-black text-gray-800 text-sm group-hover:text-red-900">{p.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{p.code}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900 group-hover:text-red-600">{p.total_stock}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Units</div>
                                        </div>
                                    </div>
                                ))}
                                {products.filter(p => p.total_stock < 5).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 italic">Inventory is healthy.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Table */}
                    <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow-2xl shadow-gray-200/50 sm:rounded-[2.5rem] border border-gray-100">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-black text-gray-800">Latest Activity</h3>
                            <Link href={route('admin.transactions')} className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all">View History</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                    <tr>
                                        <th className="py-6 px-10">Product</th>
                                        <th className="py-6 px-10">Revenue</th>
                                        <th className="py-6 px-10">Status</th>
                                        <th className="py-6 px-10 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 transition group">
                                            <td className="py-6 px-10">
                                                <div className="font-black text-gray-700">{tx.product.name}</div>
                                                <div className="text-[10px] font-mono text-gray-400">{tx.reference}</div>
                                            </td>
                                            <td className="py-6 px-10 font-black text-gray-900">Rp {Number(tx.amount).toLocaleString()}</td>
                                            <td className="py-6 px-10">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-6 px-10 text-right text-[10px] font-black text-gray-400 uppercase">{new Date(tx.created_at).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color, variant }) {
    const colors = {
        indigo: 'bg-indigo-500 text-indigo-600 bg-opacity-10',
        blue: 'bg-blue-500 text-blue-600 bg-opacity-10',
        amber: 'bg-amber-500 text-amber-600 bg-opacity-10',
        emerald: 'bg-emerald-500 text-emerald-600 bg-opacity-10',
    };

    return (
        <motion.div variants={variant} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6 group hover:-translate-y-1 transition-all">
            <div className={`p-5 rounded-[1.5rem] ${colors[color]}`}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{label}</div>
                <div className="text-2xl font-black text-gray-900 leading-none tracking-tight">{value}</div>
            </div>
        </motion.div>
    );
}
