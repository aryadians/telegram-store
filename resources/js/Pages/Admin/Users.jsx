import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { User as UserIcon, Wallet, History, Gift, BadgeCheck, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Users({ auth, users }) {
    
    const handleAdjust = (id, name) => {
        Swal.fire({
            title: `Manage Balance: ${name}`,
            text: 'Enter amount to add or subtract',
            input: 'number',
            inputPlaceholder: 'e.g. 50000',
            showCancelButton: true,
            confirmButtonText: 'Apply Transaction',
            confirmButtonColor: '#4F46E5',
            customClass: { popup: 'rounded-[2rem]' }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                router.post(route('admin.users.balance', id), { amount: result.value });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Database</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Manage bot users and credits</p>
                </div>
            }
        >
            <Head title="Users" />

            <div className="py-12 space-y-8">
                <section className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden text-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                                <tr>
                                    <th className="py-6 px-10">Client Profile</th>
                                    <th className="py-6 px-10 text-center">Identity</th>
                                    <th className="py-6 px-10">Credit Balance</th>
                                    <th className="py-6 px-10 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-indigo-50/20 transition-all group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-100 text-white">
                                                    {u.first_name ? u.first_name[0].toUpperCase() : <UserIcon />}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 text-lg tracking-tight leading-none mb-1">{u.first_name || 'Anonymous'}</div>
                                                    <div className="text-xs text-indigo-500 font-bold">@{u.username || 'no_username'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black tracking-widest uppercase mb-1">
                                                    {u.referral_code}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">REF_ID</div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl font-black text-slate-900 leading-none tracking-tighter">Rp {Number(u.balance).toLocaleString()}</div>
                                                <Wallet className="w-4 h-4 text-slate-200" />
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <button 
                                                onClick={() => handleAdjust(u.id, u.first_name)}
                                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                                            >
                                                Adjust Balance
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
