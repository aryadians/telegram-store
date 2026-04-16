import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FolderPlus, Trash2, Hash, Layers } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Categories({ auth, categories = [] }) {
    const { data, setData, post, processing, reset } = useForm({ name: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({ title: 'Success!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Taxonomies</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Organize Products</p>
                </div>
            }
        >
            <Head title="Categories" />

            <div className="max-w-4xl mx-auto space-y-8">
                <section className="premium-card">
                    <form onSubmit={submit} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Category Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field !py-2.5 text-xs" placeholder="e.g. Streaming" required />
                        </div>
                        <button type="submit" disabled={processing} className="btn-indigo !py-3 px-8">
                            <FolderPlus className="w-4 h-4" /> Add
                        </button>
                    </form>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                            <tr>
                                <th className="py-4 px-8">Category Info</th>
                                <th className="py-4 px-8 text-center">Items</th>
                                <th className="py-4 px-8 text-right">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="py-4 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs"><Layers className="w-4 h-4" /></div>
                                            <div className="text-xs font-bold text-slate-700">{cat.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8 text-center">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">{cat.products_count} Units</span>
                                    </td>
                                    <td className="py-4 px-8 text-right">
                                        <button onClick={() => router.delete(route('admin.categories.destroy', cat.id))} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
