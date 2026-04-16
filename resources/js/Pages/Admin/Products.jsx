import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Package, Pencil, Tag, DollarSign, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export default function Products({ auth, products = [], categories = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '', code: '', price: '', category_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({ title: 'Created!', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            },
        });
    };

    const handleEdit = (product) => {
        Swal.fire({
            title: 'Edit Product',
            html: `
                <div class="space-y-4 text-left p-2">
                    <input id="swal-name" class="swal2-input !m-0 !w-full !rounded-xl" value="${product.name}" placeholder="Name">
                    <input id="swal-code" class="swal2-input !m-0 !w-full !rounded-xl" value="${product.code}" placeholder="Code">
                    <input id="swal-price" type="number" class="swal2-input !m-0 !w-full !rounded-xl" value="${product.price}" placeholder="Price">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#4F46E5',
            preConfirm: () => ({
                name: document.getElementById('swal-name').value,
                code: document.getElementById('swal-code').value,
                price: document.getElementById('swal-price').value,
            })
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('admin.products.update', product.id), result.value);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Product Inventory</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Manage Digital Catalog</p>
                    </div>
                </div>
            }
        >
            <Head title="Products" />

            <div className="space-y-8">
                <section className="premium-card">
                    <div className="flex items-center gap-2 mb-6">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Add New Asset</h3>
                    </div>
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Category</label>
                            <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-field !py-2 text-xs">
                                <option value="">No Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Product Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field !py-2 text-xs" placeholder="e.g. Netflix" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="input-field !py-2 text-xs" placeholder="NFLX" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Price</label>
                            <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="input-field !py-2 text-xs" placeholder="25000" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={processing} className="btn-indigo w-full !py-2.5">Create</button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6">Product</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6">Pricing</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-slate-400" /></div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-800 uppercase">{p.name}</div>
                                                    <div className="text-[9px] font-mono text-slate-400">{p.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold uppercase">{p.category?.name || 'General'}</span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-900 text-xs">Rp{Number(p.price).toLocaleString()}</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => router.delete(route('admin.products.destroy', p.id))} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
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
