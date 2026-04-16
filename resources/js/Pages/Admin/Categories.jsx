import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FolderPlus, Trash2, Hash, Layers } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Categories({ auth, categories }) {
    const { data, setData, post, processing, reset } = useForm({ name: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({
                    title: 'Category Created',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: { popup: 'rounded-2xl' }
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Taxonomies</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Organize your inventory categories</p>
                </div>
            }
        >
            <Head title="Categories" />

            <div className="max-w-4xl mx-auto space-y-10">
                <section className="premium-card">
                    <form onSubmit={submit} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">New Category Label</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="e.g. Streaming Services" required />
                        </div>
                        <button type="submit" disabled={processing} className="btn-indigo h-[58px] px-10">
                            <FolderPlus className="w-5 h-5" /> Add
                        </button>
                    </form>
                </section>

                <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="py-6 px-10">Category Information</th>
                                <th className="py-6 px-10 text-center">Linked Products</th>
                                <th className="py-6 px-10 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-indigo-50/20 transition-all group">
                                    <td className="py-5 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="font-bold text-slate-800">{cat.name}</div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-10 text-center">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                                            {cat.products_count} Items
                                        </span>
                                    </td>
                                    <td className="py-5 px-10 text-right">
                                        <button 
                                            onClick={() => router.delete(route('admin.categories.destroy', cat.id))}
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
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
