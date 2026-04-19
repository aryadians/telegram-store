import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { 
    Download, Users, TrendingUp, Clock, AlertCircle, 
    ShoppingCart, Sparkles, Megaphone, Database, ArrowUpRight, DollarSign,
    Target, Zap, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, products = [], recentTransactions = [], stats = {}, salesChart = [] }) {
    
    const chartData = (salesChart || []).map(item => ({
        name: item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A',
        total: Number(item.total || 0)
    }));

    const interactionData = (stats.top_interactions || []).map(item => ({
        name: item.action.replace('CLICK_', '').replace('CMD_', '').substring(0, 10),
        value: item.total
    }));

    const segmentData = [
        { name: 'Whales', value: stats.segments?.whale || 0, color: '#4F46E5' },
        { name: 'Loyal', value: stats.segments?.loyal || 0, color: '#818CF8' },
        { name: 'Newbie', value: stats.segments?.newbie || 0, color: '#C7D2FE' },
    ];

    const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                            Empire Intelligence <Target className="w-4 h-4 text-indigo-500" />
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Data-Driven Sovereignty</p>
                    </div>
                </div>
            }
        >
            <Head title="Intelligence" />

            <div className="space-y-6 pb-20">
                
                {/* CORE STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Revenue" value={`Rp${Number(stats.total_revenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
                    <StatCard label="Net Profit" value={`Rp${Number(stats.total_profit || 0).toLocaleString()}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatCard label="Customer Base" value={stats.total_users || 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
                    <StatCard label="Avg Rating" value={`⭐ ${Number(stats.avg_rating || 0).toFixed(1)}`} icon={Sparkles} color="text-amber-600" bg="bg-amber-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* INTERACTION INTEL */}
                    <div className="lg:col-span-2 premium-card">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Behavioral Clickstream (Top Actions)</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={interactionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '700', fill: '#94A3B8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '700', fill: '#94A3B8'}} />
                                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="value" fill="#4F46E5" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SEGMENTATION PIE */}
                    <div className="premium-card">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">User Segmentation</h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={segmentData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {segmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4">
                            {segmentData.map(s => (
                                <div key={s.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-800">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* RECENT ACTIVITY */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 font-black text-[9px] uppercase tracking-widest text-slate-400 text-center">Live Transaction Feed</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-50">
                                    {recentTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-4 px-8">
                                                <div className="text-xs font-bold text-slate-800 uppercase">{tx.product?.name || 'Deposit'}</div>
                                                <div className="text-[9px] font-mono text-slate-400">UID: {tx.chat_id}</div>
                                            </td>
                                            <td className="py-4 px-8 text-right font-black text-slate-900 text-xs">Rp{Number(tx.amount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* GROWTH ANALYSIS */}
                    <div className="premium-card">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Revenue Growth (7D)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94A3B8'}} />
                                    <YAxis axisLine={false} hide />
                                    <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                                    <Area type="monotone" dataKey="total" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="premium-card !p-6 shadow-sm border-slate-100">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${bg} ${color} border border-current border-opacity-10`}><Icon className="w-4 h-4" /></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight leading-none">{value}</div>
        </div>
    );
}
