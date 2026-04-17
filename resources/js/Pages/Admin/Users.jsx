import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { User as UserIcon, Wallet, ShoppingCart, History, Users as UsersIcon, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function Users({ auth, users = { data: [], links: [] } }) {
    
    const showDossier = (user) => {
        const txList = user.transactions?.slice(0, 5).map(tx => `
            <div class="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-100 mb-2">
                <div class="text-[10px] font-bold text-slate-700">${tx.product?.name || 'Deposit'}</div>
                <div class="text-[10px] font-black text-indigo-600">Rp ${Number(tx.amount).toLocaleString()}</div>
            </div>
        `).join('') || '<div class="text-center text-slate-400 py-4 text-xs italic">No activity yet</div>';

        Swal.fire({
            title: `<div class="flex items-center gap-2 px-4"><div class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">${user.first_name[0]}</div> <div><div class="text-sm font-black text-slate-800 uppercase text-left">${user.first_name}</div><div class="text-[9px] text-slate-400 font-bold tracking-widest text-left mt-0.5">@${user.username || 'no_user'}</div></div></div>`,
            html: `
                <div class="text-left p-4 space-y-6">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <div class="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Wallet</div>
                            <div class="text-sm font-black text-indigo-700 leading-none">Rp ${Number(user.balance).toLocaleString()}</div>
                        </div>
                        <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                            <div class="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Lifetime Spent</div>
                            <div class="text-sm font-black text-emerald-700 leading-none">Rp ${Number(user.total_spent || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-3 px-1">
                            <History className="w-3.5 h-3.5 text-slate-400" />
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Ledger Events</span>
                        </div>
                        <div class="max-h-60 overflow-y-auto pr-1">
                            ${txList}
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            width: '28rem',
            customClass: { popup: 'rounded-[2.5rem] border-none shadow-2xl' }
        });
    };

    const handleAdjust = (id, name) => {
        Swal.fire({
            title: `Sync Credit: ${name}`,
            input: 'number',
            inputPlaceholder: 'Enter amount...',
            showCancelButton: true,
            confirmButtonText: 'Add Credit',
            confirmButtonColor: '#4F46E5',
            customClass: { popup: 'rounded-[2rem]' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.users.balance', id), { amount: result.value });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Intelligence CRM</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Global Customer Base</p>
                </div>
            }
        >
            <Head title="CRM" />

            <div className="space-y-6 pb-20">
                <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                <tr>
                                    <th className="py-6 px-10">Client Identity</th>
                                    <th className="py-6 px-8 text-center">Score</th>
                                    <th className="py-6 px-8">Wallet Balance</th>
                                    <th className="py-6 px-10 text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => showDossier(u)}>
                                        <td className="py-5 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {u.first_name ? u.first_name[0] : '?'}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">{u.first_name || 'Anonymous'}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic opacity-60">@{u.username || 'unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                                <span className="text-[9px] font-black text-amber-700 uppercase tracking-tighter">{u.paid_count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 font-black text-slate-900 text-xs">Rp{Number(u.balance).toLocaleString()}</td>
                                        <td className="py-5 px-10 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleAdjust(u.id, u.first_name)} className="px-5 py-2 bg-[#0F172A] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100">Add Credit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Page {users.current_page}</span>
                        <div className="flex gap-2">
                            {(users.links || []).map((link, i) => (
                                <button key={i} disabled={!link.url} dangerouslySetInnerHTML={{ __html: link.label }} onClick={() => window.location.href = link.url} className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${link.active ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'} ${!link.url ? 'opacity-20' : ''}`} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
