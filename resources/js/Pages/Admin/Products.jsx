import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

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
            onSuccess: () => reset(),
        });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.products.status', id));
    };

    const deleteProduct = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('admin.products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Products Management</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4">Add New Product</h3>
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select 
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Code</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 h-10">
                                Save
                            </button>
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Category</th>
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Price</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="border-b">
                                        <td className="py-2 text-sm text-gray-500">{p.category?.name || '-'}</td>
                                        <td className="py-2">{p.name} ({p.code})</td>
                                        <td className="py-2">Rp {Number(p.price).toLocaleString()}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-2 space-x-2">
                                            <button onClick={() => toggleStatus(p.id)} className="text-yellow-600 hover:underline">Toggle</button>
                                            <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
