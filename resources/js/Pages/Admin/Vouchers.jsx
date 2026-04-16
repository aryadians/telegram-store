import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Ticket, Plus, Trash2, Zap, Percent, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Vouchers({ auth, vouchers }) {
    const { data, setData, post, processing, reset } = useForm({
        code: '',
        type: 'fixed',
        value: '',
        limit: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.vouchers.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({ title: 'Success!', text: 'Voucher code is live.', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Voucher Factory</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Generate discount codes for growth</p>
                </div>
            }
        >
            <Head title="Vouchers" />

            <div className="py-12 space-y-10">
                <section className="premium-card">
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Voucher Code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} className="input-field font-black text-indigo-600" placeholder="MEGA50" required />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Disc. Type</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)} className="input-field">
                                <option value="fixed">Fixed Amount (IDR)</option>
                                <option value="percent">Percentage (%)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Value</label>
                            <input type="number" value={data.value} onChange={e => setData('value', e.target.value)} className="input-field" placeholder="5000" required />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Limit (0=∞)</label>
                            <input type="number" value={data.limit} onChange={e => setData('limit', e.target.value)} className="input-field" placeholder="100" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={processing} className="btn-indigo w-full">
                                <Plus className="w-5 h-5" /> Create
                            </button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="py-6 px-10">Voucher Key</th>
                                <th className="py-6 px-10">Reduction</th>
                                <th className="py-6 px-10">Utilization</th>
                                <th className="py-6 px-10 text-right">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                            {vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-indigo-50/20 transition-all group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <span className="font-black text-slate-800 tracking-widest text-lg">{v.code}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                                            {v.type === 'percent' ? <Percent className="w-4 h-4 text-indigo-500" /> : <div className="text-xs text-indigo-500">Rp</div>}
                                            {v.type === 'percent' ? `${v.value}%` : Number(v.value).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                                                <div className="h-full bg-indigo-600" style={{ width: `${v.limit > 0 ? (v.used / v.limit) * 100 : 0}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{v.used} / {v.limit || '∞'}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <button onClick={() => router.delete(route('admin.vouchers.destroy', v.id))} className="p-2 text-slate-300 hover:text-red-600 transition-all active:scale-90">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
