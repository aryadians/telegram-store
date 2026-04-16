import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Megaphone, Send, Users, Info } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Broadcast({ auth, total_users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Send Broadcast?',
            text: `This message will be sent to ${total_users} users.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Yes, Blast it!',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.broadcast.send'), {
                    onSuccess: () => {
                        reset();
                        Swal.fire('Sent!', 'Broadcast has been queued.', 'success');
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-gray-800 tracking-tight">Marketing Broadcast</h2>}
        >
            <Head title="Broadcast" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <div className="bg-white shadow-xl shadow-indigo-100 sm:rounded-3xl border border-gray-100 p-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                                        <Megaphone className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Compose Broadcast</h3>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                            Message Content <span className="lowercase font-normal opacity-50">(HTML supported)</span>
                                        </label>
                                        <textarea 
                                            className="w-full h-72 border-gray-200 rounded-3xl p-6 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-gray-700 leading-relaxed"
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            placeholder="🚀 FLASH SALE! 50% OFF FOR ALL ACCOUNTS..."
                                        ></textarea>
                                        {errors.message && <div className="text-red-500 text-xs mt-1 font-bold">{errors.message}</div>}
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" /> Blast Message Now
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 text-center">
                                <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4">
                                    <Users className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div className="text-3xl font-black text-gray-900">{total_users}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Bot Users</div>
                            </div>

                            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 shadow-xl shadow-amber-50/20">
                                <div className="flex items-center gap-2 text-amber-700 font-bold mb-3 uppercase text-[10px] tracking-widest">
                                    <Info className="w-4 h-4" /> Usage Tips
                                </div>
                                <ul className="text-sm text-amber-800 space-y-3 font-medium leading-relaxed">
                                    <li>• Use <b>&lt;b&gt;bold&lt;/b&gt;</b> for highlights.</li>
                                    <li>• Telegram emojis are fully supported.</li>
                                    <li>• Do not spam to avoid bot ban.</li>
                                    <li>• Best time: 19:00 - 21:00 WIB.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
