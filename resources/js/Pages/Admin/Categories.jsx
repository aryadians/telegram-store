import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FolderPlus, Trash2, Hash } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Categories({ auth, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({
                    title: 'Success!',
                    text: 'Category created.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    };

    const deleteCategory = (id) => {
        Swal.fire({
            title: 'Delete Category?',
            text: "This will affect products linked to it!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Yes, delete',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.categories.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-gray-800 tracking-tight">Categories</h2>}
        >
            <Head title="Categories" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-xl shadow-indigo-100 sm:rounded-2xl p-8 mb-8 border border-gray-100">
                        <form onSubmit={submit} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-wider">New Category Name</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    placeholder="e.g. Streaming Services"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <FolderPlus className="w-4 h-4" /> Add
                            </button>
                        </form>
                    </div>

                    <div className="bg-white shadow-xl shadow-gray-100 sm:rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <th className="py-5 px-8">Category Name</th>
                                    <th className="py-5 px-8">Products</th>
                                    <th className="py-5 px-8 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-4 px-8 font-bold text-gray-700">{cat.name}</td>
                                        <td className="py-4 px-8 text-sm text-gray-400 flex items-center gap-1">
                                            <Hash className="w-3 h-3" /> {cat.products_count}
                                        </td>
                                        <td className="py-4 px-8 text-right">
                                            <button 
                                                onClick={() => deleteCategory(cat.id)}
                                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
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
