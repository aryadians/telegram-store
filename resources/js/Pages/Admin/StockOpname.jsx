import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Database, ListTree, AlignLeft, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StockOpname({ auth, products }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        assets_data: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.stock-opname.store'), {
            onSuccess: () => {
                reset('assets_data');
                Swal.fire({
                    title: 'Stock Updated!',
                    text: 'Assets have been bulk inserted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-gray-800 tracking-tight text-center">Stock Refill Engine</h2>}
        >
            <Head title="Stock Opname" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-2xl shadow-indigo-100 sm:rounded-3xl border border-gray-100 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Database className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Bulk Stock Upload</h3>
                                    <p className="text-indigo-100 text-sm">Add multiple accounts in one go.</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-12 h-12 text-indigo-300 opacity-50" />
                        </div>

                        <form onSubmit={submit} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 tracking-widest">
                                    <ListTree className="w-4 h-4 text-indigo-500" /> Target Product
                                </label>
                                <select 
                                    className="w-full border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-gray-700 font-semibold"
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                >
                                    <option value="">-- Choose Product to Refill --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.product_id && <div className="text-red-500 text-xs mt-1 font-bold">{errors.product_id}</div>}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 tracking-widest">
                                    <AlignLeft className="w-4 h-4 text-indigo-500" /> Account Details (One per line)
                                </label>
                                <textarea 
                                    className="w-full h-64 border-gray-200 rounded-3xl p-6 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed"
                                    value={data.assets_data}
                                    onChange={e => setData('assets_data', e.target.value)}
                                    placeholder="user@example.com:password123&#10;another@user.com:pass456"
                                ></textarea>
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                    <span>Format: email:password</span>
                                    <span>{data.assets_data.split('\n').filter(l => l.trim()).length} accounts detected</span>
                                </div>
                                {errors.assets_data && <div className="text-red-500 text-xs mt-1 font-bold">{errors.assets_data}</div>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                            >
                                {processing ? (
                                    <>Injecting...</>
                                ) : (
                                    <>Inject Stock to Database</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
