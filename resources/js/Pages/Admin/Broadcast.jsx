import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Megaphone, Send, Users, Info } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Broadcast({ auth, total_users }) {
    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });

    const submit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Confirm Blast?',
            text: `Reaching ${total_users} users.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.broadcast.send'), {
                    onSuccess: () => {
                        reset();
                        Swal.fire({ title: 'Blasted!', icon: 'success', customClass: { popup: 'rounded-2xl' } });
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Marketing Blast</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Direct Bot Communication</p>
                </div>
            }
        >
            <Head title="Broadcast" />

            <div className="max-w-5xl mx-auto py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <section className="premium-card">
                            <div className="flex items-center gap-2 mb-6">
                                <Megaphone className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Compose Promo</h3>
                            </div>
                            <form onSubmit={submit} className="space-y-6">
                                <textarea 
                                    className="input-field h-64 !py-4 font-medium text-sm leading-relaxed"
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Type your HTML-supported message here..."
                                    required
                                ></textarea>
                                <button type="submit" disabled={processing} className="btn-indigo w-full !py-3">
                                    <Send className="w-4 h-4" /> Dispatch Now
                                </button>
                            </form>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="premium-card text-center">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                            <div className="text-3xl font-black text-slate-900">{total_users}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bot Subscribers</div>
                        </div>
                        <div className="premium-card bg-indigo-50/30 border-indigo-100">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4 uppercase text-[10px] tracking-widest">
                                <Info className="w-4 h-4" /> Styling Guide
                            </div>
                            <ul className="text-[11px] text-indigo-900/60 space-y-2 font-bold uppercase leading-relaxed">
                                <li>• &lt;b&gt;bold text&lt;/b&gt;</li>
                                <li>• &lt;i&gt;italic text&lt;/i&gt;</li>
                                <li>• &lt;code&gt;monospaced&lt;/code&gt;</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
