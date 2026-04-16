import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Package, Pencil, Tag, DollarSign, Layers } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Products({ auth, products = [], categories = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '', code: '', price: '', cost_price: '', category_id: '',
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
                    <div class="grid grid-cols-2 gap-4">
                        <input id="swal-price" type="number" class="swal2-input !m-0 !w-full !rounded-xl" value="${product.price}" placeholder="Sell Price">
                        <input id="swal-cost" type="number" class="swal2-input !m-0 !w-full !rounded-xl" value="${product.cost_price}" placeholder="Cost Price">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#4F46E5',
            preConfirm: () => ({
                name: document.getElementById('swal-name').value,
                code: document.getElementById('swal-code').value,
                price: document.getElementById('swal-price').value,
                cost_price: document.getElementById('swal-cost').value,
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
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Product Inventory</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Manage Catalog & Margins</p>
                </div>
            }
        >
            <Head title="Products" />

            <div className="space-y-8">
                <section className="premium-card">
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                            <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-field !py-2 text-xs">
                                <option value="">No Category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Product Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field !py-2 text-xs" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="input-field !py-2 text-xs" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase text-indigo-600">Sell Price</label>
                            <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="input-field !py-2 text-xs" />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase text-rose-600">Cost</label>
                            <input type="number" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} className="input-field !py-2 text-xs" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={processing} className="btn-indigo w-full !py-2.5">Create</button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="py-4 px-8">Asset</th>
                                <th className="py-4 px-8">Pricing (Sell/Cost)</th>
                                <th className="py-4 px-8">Margin</th>
                                <th className="py-4 px-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="py-4 px-8">
                                        <div className="font-bold text-slate-800 uppercase">{p.name}</div>
                                        <div className="text-[9px] font-mono text-slate-400">{p.code}</div>
                                    </td>
                                    <td className="py-4 px-8">
                                        <div className="font-black text-slate-900">Rp{Number(p.price).toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-400">Modal: Rp{Number(p.cost_price).toLocaleString()}</div>
                                    </td>
                                    <td className="py-4 px-8">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase">
                                            +Rp{Number(p.price - p.cost_price).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-8 text-right flex justify-end gap-1">
                                        <button onClick={() => handleEdit(p)} className="p-2 text-slate-300 hover:text-indigo-600 transition"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => router.delete(route('admin.products.destroy', p.id))} className="p-2 text-slate-300 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
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
