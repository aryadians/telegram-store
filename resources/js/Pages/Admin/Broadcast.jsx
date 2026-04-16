import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Broadcast({ auth, total_users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.broadcast.send'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Broadcast Promo</h2>}
        >
            <Head title="Broadcast" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                            📢 Pesan akan dikirim ke <b>{total_users}</b> user bot Anda.
                        </div>

                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Message (HTML Supported)</label>
                                <textarea 
                                    className="w-full h-48 border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Contoh: <b>PROMO HARI INI!</b>&#10;Diskon Netflix 50%, buruan beli sebelum habis!"
                                ></textarea>
                                {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                {processing ? 'Sending...' : '🚀 Send Broadcast Now'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
