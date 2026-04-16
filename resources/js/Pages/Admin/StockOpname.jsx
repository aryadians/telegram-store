import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function StockOpname({ auth, products }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        assets_data: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.stock-opname.store'), {
            onSuccess: () => reset('assets_data'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Opname</h2>}
        >
            <Head title="Stock Opname" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Product</label>
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.product_id && <div className="text-red-500 text-xs mt-1">{errors.product_id}</div>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Assets Data (One per line: email:pass)</label>
                                <textarea 
                                    className="w-full h-48 border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                                    value={data.assets_data}
                                    onChange={e => setData('assets_data', e.target.value)}
                                    placeholder="user1:pass1&#10;user2:pass2"
                                ></textarea>
                                {errors.assets_data && <div className="text-red-500 text-xs mt-1">{errors.assets_data}</div>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                {processing ? 'Inserting...' : 'Bulk Insert Assets'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
