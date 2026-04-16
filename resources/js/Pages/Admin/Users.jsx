import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { User as UserIcon, Wallet } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Users({ auth, users = { data: [], links: [] } }) {
    
    const handleAdjust = (id, name) => {
        Swal.fire({
            title: `Credit Adjust: ${name}`,
            input: 'number',
            inputPlaceholder: 'Amount',
            showCancelButton: true,
            confirmButtonText: 'Sync Balance',
            confirmButtonColor: '#4F46E5',
            customClass: { popup: 'rounded-2xl' }
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
                    <h2 className="text-xl font-bold text-slate-800">Client Hub</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Manage Bot Subscribers</p>
                </div>
            }
        >
            <Head title="Users" />

            <div className="space-y-6">
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                                <tr>
                                    <th className="py-4 px-8">Subscriber</th>
                                    <th className="py-4 px-8 text-center">Ref Code</th>
                                    <th className="py-4 px-8">Balance</th>
                                    <th className="py-4 px-8 text-right">Credit Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                                    {u.first_name ? u.first_name[0] : '?'}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{u.first_name || 'Subscriber'}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">@{u.username || 'no_id'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-8 text-center">
                                            <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest leading-none">
                                                {u.referral_code}
                                            </span>
                                        </td>
                                        <td className="py-4 px-8 font-bold text-slate-900 text-xs">Rp{Number(u.balance).toLocaleString()}</td>
                                        <td className="py-4 px-8 text-right">
                                            <button 
                                                onClick={() => handleAdjust(u.id, u.first_name)}
                                                className="btn-indigo !py-1.5 px-4 !text-[9px] inline-flex"
                                            >
                                                Adjust Credit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
