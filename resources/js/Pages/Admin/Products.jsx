import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, ToggleLeft, ToggleRight, Trash2, Tag, DollarSign, Code, Layers } from 'lucide-react';
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
                    text: 'Product has been added.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    borderRadius: '1rem',
                });
            },
        });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.products.status', id));
    };

    const deleteProduct = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete it!',
            borderRadius: '1rem',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.products.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-gray-800 tracking-tight">Products Management</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Add Product Card */}
                    <div className="bg-white overflow-hidden shadow-xl shadow-indigo-100 sm:rounded-2xl p-8 mb-8 border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Plus className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Create New Product</h3>
                        </div>
                        
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> Category
                                </label>
                                <select 
                                    className="w-full border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Name
                                </label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="e.g. Netflix Premium" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                                    <Code className="w-3 h-3" /> Code
                                </label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="NFLX1" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Price
                                </label>
                                <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="25000" />
                            </div>
                            <div className="pt-5">
                                <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50">
                                    {processing ? 'Processing...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Product List */}
                    <div className="bg-white overflow-hidden shadow-xl shadow-gray-100 sm:rounded-2xl border border-gray-100">
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                        <th className="py-5 px-6">Category</th>
                                        <th className="py-5 px-6">Product Information</th>
                                        <th className="py-5 px-6">Pricing</th>
                                        <th className="py-5 px-6">Status</th>
                                        <th className="py-5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                                    {p.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-800">{p.name}</div>
                                                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{p.code}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-black text-gray-900 leading-none">Rp {Number(p.price).toLocaleString()}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {p.is_active ? 'Active' : 'Disabled'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => toggleStatus(p.id)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Toggle Status">
                                                        {p.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                                    </button>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Product">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
