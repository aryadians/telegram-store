import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Database, ListTree, AlignLeft, CheckCircle2, Terminal, FileUp, Info } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StockOpname({ auth, products = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        product_id: '',
        assets_data: '',
        csv_file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.stock-opname.store'), {
            onSuccess: () => {
                reset('assets_data', 'csv_file');
                Swal.fire({ title: 'Stock Updated', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            },
        });
    };

    const detectCount = data.assets_data ? data.assets_data.split('\n').filter(l => l.trim()).length : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Stock Injection</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Refill Database Stock</p>
                </div>
            }
        >
            <Head title="Stock Injection" />

            <div className="max-w-5xl mx-auto space-y-8">
                <section className="premium-card">
                    <form onSubmit={submit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Product</label>
                                <select value={data.product_id} onChange={e => setData('product_id', e.target.value)} className="input-field py-3 text-sm font-bold" required>
                                    <option value="">-- CHOOSE PRODUCT --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CSV Data Feed</label>
                                <input type="file" onChange={e => setData('csv_file', e.target.files[0])} className="input-field !p-2 text-xs" accept=".csv" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raw Input Line-by-line</label>
                                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">Detected: {detectCount} Units</span>
                            </div>
                            <textarea 
                                value={data.assets_data} 
                                onChange={e => setData('assets_data', e.target.value)}
                                className="input-field h-48 font-mono text-xs bg-slate-50 shadow-inner"
                                placeholder="email:pass"
                            ></textarea>
                        </div>

                        <button type="submit" disabled={processing} className="btn-indigo w-full !py-4 text-sm uppercase">
                            <Database className="w-4 h-4" /> Start Stock Injection
                        </button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
