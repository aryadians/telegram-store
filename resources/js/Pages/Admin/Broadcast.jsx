import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Megaphone, Send, Users, Info, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export default function Broadcast({ auth, total_users }) {
    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });

    const submit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Blast Promo?',
            text: `This will instantly reach ${total_users} users.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Yes, Send Now!',
            customClass: { popup: 'rounded-[2rem]' }
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.broadcast.send'), {
                    onSuccess: () => {
                        reset();
                        Swal.fire({ title: 'Blasted!', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
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
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Marketing Blast</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1 text-center text-indigo-600 flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> Boost your sales instantly</p>
                </div>
            }
        >
            <Head title="Broadcast" />

            <div className="max-w-5xl mx-auto py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <section className="premium-card p-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-200">
                                    <Megaphone className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Compose Message</h3>
                            </div>

                            <form onSubmit={submit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Message Body (Telegram HTML)</label>
                                    <textarea 
                                        className="w-full h-80 border-slate-200 rounded-[2rem] p-8 focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-slate-700 leading-relaxed font-medium text-lg placeholder:text-slate-200 shadow-inner"
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        placeholder="🚀 HUGE SALE! Get 50% OFF on all Netflix Premium accounts today only..."
                                    ></textarea>
                                    {errors.message && <div className="text-red-500 text-xs mt-1 font-bold">{errors.message}</div>}
                                </div>

                                <button type="submit" disabled={processing} className="btn-indigo w-full py-6 text-xl">
                                    <Send className="w-6 h-6" /> Blast Message Now
                                </button>
                            </form>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-center shadow-2xl shadow-slate-300">
                            <div className="inline-flex p-5 bg-white/10 rounded-full mb-6 text-white border border-white/10">
                                <Users className="w-10 h-10" />
                            </div>
                            <div className="text-5xl font-black text-white mb-2 tracking-tighter">{total_users}</div>
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Bot Subscribers</div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100">
                            <div className="flex items-center gap-2 text-indigo-600 font-black mb-6 uppercase text-xs tracking-widest">
                                <Info className="w-5 h-5 shrink-0" /> Formatting Guide
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm font-bold text-slate-500">
                                    <span className="text-indigo-600">&bull;</span> Use &lt;b&gt;text&lt;/b&gt; for bold.
                                </li>
                                <li className="flex gap-3 text-sm font-bold text-slate-500">
                                    <span className="text-indigo-600">&bull;</span> Use &lt;i&gt;text&lt;/i&gt; for italic.
                                </li>
                                <li className="flex gap-3 text-sm font-bold text-slate-500">
                                    <span className="text-indigo-600">&bull;</span> Use &lt;code&gt;text&lt;/code&gt; for code.
                                </li>
                                <li className="flex gap-3 text-sm font-bold text-slate-500 leading-relaxed">
                                    <span className="text-indigo-600">&bull;</span> Emojis make your promo 3x more effective.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
