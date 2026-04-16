import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, ToggleLeft, ToggleRight, Trash2, Tag, DollarSign, Code, Layers, Package, Pencil } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Products({ auth, products, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        price: '',
        category_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({
                    title: 'Success!',
                    text: 'Product added successfully.',
                    icon: 'success',
                    customClass: { popup: 'rounded-[2rem]' }
                });
            },
        });
    };

    const handleEdit = (product) => {
        Swal.fire({
            title: 'Edit Product',
            html: `
                <div class="space-y-4 text-left p-2">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400">Product Name</label>
                        <input id="swal-name" class="swal2-input !m-0 !w-full !rounded-xl !border-slate-200" value="${product.name}">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400">Product Code</label>
                        <input id="swal-code" class="swal2-input !m-0 !w-full !rounded-xl !border-slate-200" value="${product.code}">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400">Price (IDR)</label>
                        <input id="swal-price" type="number" class="swal2-input !m-0 !w-full !rounded-xl !border-slate-200" value="${product.price}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            confirmButtonColor: '#4F46E5',
            customClass: { popup: 'rounded-[2.5rem]' },
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-name').value,
                    code: document.getElementById('swal-code').value,
                    price: document.getElementById('swal-price').value,
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('admin.products.update', product.id), result.value, {
                    onSuccess: () => Swal.fire({ title: 'Updated!', icon: 'success', customClass: { popup: 'rounded-[2rem]' } })
                });
            }
        });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.products.status', id));
    };

    const deleteProduct = (id) => {
        Swal.fire({
            title: 'Delete Product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete it!',
            customClass: { popup: 'rounded-[2rem]' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.products.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Inventory</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Manage your digital storefront</p>
                </div>
            }
        >
            <Head title="Products" />

            <div className="space-y-10">
                <section className="premium-card">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Add New Product</h3>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                            <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-field">
                                <option value="">No Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="Netflix Premium" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="input-field" placeholder="NFLX-1M" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Price (IDR)</label>
                            <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="input-field" placeholder="25000" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={processing} className="btn-indigo w-full">Create</button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                                <tr>
                                    <th className="py-6 px-10">Product Detail</th>
                                    <th className="py-6 px-10">Category</th>
                                    <th className="py-6 px-10">Pricing</th>
                                    <th className="py-6 px-10">Status</th>
                                    <th className="py-6 px-10 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-indigo-50/20 transition-all group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                                    <Package className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 uppercase tracking-tight">{p.name}</div>
                                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {p.category?.name || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="text-sm font-black text-slate-900 leading-none">Rp {Number(p.price).toLocaleString()}</div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <button onClick={() => toggleStatus(p.id)} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-red-700'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                {p.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm">
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => deleteProduct(p.id)} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
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
