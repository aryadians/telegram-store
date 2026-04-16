import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Ticket, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Vouchers({ auth, vouchers = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        code: '', type: 'fixed', value: '', limit: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.vouchers.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({ title: 'Success!', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Voucher Hub</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Discount Management</p>
                </div>
            }
        >
            <Head title="Vouchers" />

            <div className="space-y-8">
                <section className="premium-card">
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voucher Code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} className="input-field !py-2.5 text-xs font-black text-indigo-600" placeholder="PROMO" required />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)} className="input-field !py-2.5 text-xs font-bold">
                                <option value="fixed">Fixed (Rp)</option>
                                <option value="percent">Percent (%)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value</label>
                            <input type="number" value={data.value} onChange={e => setData('value', e.target.value)} className="input-field !py-2.5 text-xs font-bold" placeholder="5000" required />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit</label>
                            <input type="number" value={data.limit} onChange={e => setData('limit', e.target.value)} className="input-field !py-2.5 text-xs font-bold" placeholder="100" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={processing} className="btn-indigo w-full !py-3">Generate</button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            <tr>
                                <th className="py-4 px-8">Voucher Code</th>
                                <th className="py-4 px-8">Benefit</th>
                                <th className="py-4 px-8">Usage</th>
                                <th className="py-4 px-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                            {vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="py-4 px-8">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-indigo-600" />
                                            <span className="text-xs font-black text-slate-800 tracking-widest uppercase">{v.code}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-xs font-bold text-slate-900">
                                        {v.type === 'percent' ? `${v.value}%` : `Rp${Number(v.value).toLocaleString()}`}
                                    </td>
                                    <td className="py-4 px-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${v.limit > 0 ? (v.used / v.limit) * 100 : 0}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{v.used} / {v.limit || '∞'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-right">
                                        <button onClick={() => router.delete(route('admin.vouchers.destroy', v.id))} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
