import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Package, Pencil, Tag, DollarSign, Layers, Image as ImageIcon, AlignLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Products({ auth, products = [], categories = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '', code: '', price: '', cost_price: '', category_id: '', image_url: '', description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onSuccess: () => { reset(); Swal.fire({ title: 'Created!', icon: 'success' }); },
        });
    };

    const handleEdit = (product) => {
        Swal.fire({
            title: 'Edit Apex Product',
            html: `
                <div class="space-y-3 text-left p-1">
                    <input id="swal-name" class="swal2-input !m-0 !w-full !text-sm" value="${product.name}" placeholder="Name">
                    <input id="swal-img" class="swal2-input !m-0 !w-full !text-xs font-mono" value="${product.image_url || ''}" placeholder="Image URL">
                    <textarea id="swal-desc" class="swal2-textarea !m-0 !w-full !text-xs" placeholder="Short Description">${product.description || ''}</textarea>
                    <div class="grid grid-cols-2 gap-2">
                        <input id="swal-price" type="number" class="swal2-input !m-0 !w-full !text-sm" value="${product.price}" placeholder="Sell">
                        <input id="swal-cost" type="number" class="swal2-input !m-0 !w-full !text-sm" value="${product.cost_price}" placeholder="Cost">
                    </div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'Sync',
            preConfirm: () => ({
                name: document.getElementById('swal-name').value,
                image_url: document.getElementById('swal-img').value,
                description: document.getElementById('swal-desc').value,
                price: document.getElementById('swal-price').value,
                cost_price: document.getElementById('swal-cost').value,
            })
        }).then((result) => {
            if (result.isConfirmed) router.put(route('admin.products.update', product.id), result.value);
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Apex Inventory</h2>
                        <p className="text-xs text-slate-400 font-medium">Digital Asset Mastery</p>
                    </div>
                </div>
            }
        >
            <Head title="Apex Products" />

            <div className="space-y-8 pb-20">
                <section className="premium-card">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">Product Name</label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input-field" placeholder="e.g. Netflix Premium" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Category</label><select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-field">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Code</label><input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="input-field" placeholder="NFLX" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image URL</label><input type="text" value={data.image_url} onChange={e => setData('image_url', e.target.value)} className="input-field font-mono text-xs" placeholder="https://..." /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase text-indigo-600">Sell Price</label><input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="input-field font-bold" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase text-rose-600">Cost Price</label><input type="number" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} className="input-field font-bold" /></div>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Short Description</label><textarea value={data.description} onChange={e => setData('description', e.target.value)} className="input-field h-20 text-xs" placeholder="Describe the benefit..."></textarea></div>
                        <button type="submit" disabled={processing} className="btn-indigo w-full !py-3 uppercase font-black tracking-widest">Deploy Product to Catalog</button>
                    </form>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase text-slate-400 tracking-widest">
                            <tr><th className="py-4 px-8">Product</th><th className="py-4 px-8">Pricing</th><th className="py-4 px-8 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition group">
                                    <td className="py-4 px-8">
                                        <div className="flex items-center gap-4">
                                            {p.image_url ? <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover shadow-sm" /> : <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                                            <div><div className="font-bold text-slate-800 uppercase leading-none mb-1">{p.name}</div><div className="text-[10px] text-slate-400 font-mono italic">{p.code}</div></div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-8">
                                        <div className="font-black text-slate-900">Rp{Number(p.price).toLocaleString()}</div>
                                        <div className="text-[10px] text-emerald-600 font-bold uppercase">Profit: Rp{Number(p.price - p.cost_price).toLocaleString()}</div>
                                    </td>
                                    <td className="py-4 px-8 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
