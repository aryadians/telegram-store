import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Megaphone, Save, Trash2, Send, Plus, Layout, FileText, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Broadcast({ auth, total_users, templates = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const { data: tData, setData: setTData, post: postTemplate, processing: tProcessing, reset: resetTemplate } = useForm({
        title: '',
        message: '',
    });

    const sendBlast = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Send Broadcast?',
            text: `Sending message to ${total_users} users.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, Blast!',
            confirmButtonColor: '#4F46E5',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.broadcast.send'), {
                    onSuccess: () => Swal.fire({ title: 'Success!', text: 'Blast sent successfully.', icon: 'success' })
                });
            }
        });
    };

    const handleSaveTemplate = (e) => {
        e.preventDefault();
        postTemplate(route('admin.broadcast.template.store'), {
            onSuccess: () => {
                resetTemplate();
                Swal.fire({ title: 'Saved!', icon: 'success' });
            }
        });
    };

    const useTemplate = (t) => {
        setData('message', t.message);
        Swal.fire({ title: 'Template Selected', text: 'Message field populated.', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Marketing Hub</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Broadcast Engine & Templates</p>
                </div>
            }
        >
            <Head title="Broadcast" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: TEMPLATE CRUD */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="premium-card">
                        <div className="flex items-center gap-2 mb-6">
                            <Plus className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">Create Template</h3>
                        </div>
                        <form onSubmit={handleSaveTemplate} className="space-y-4">
                            <input type="text" value={tData.title} onChange={e => setTData('title', e.target.value)} className="input-field !py-2.5 text-xs font-bold" placeholder="Template Label..." required />
                            <textarea value={tData.message} onChange={e => setTData('message', e.target.value)} className="input-field h-32 text-[10px] font-mono leading-tight bg-slate-50 border-none" placeholder="HTML Message Content..." required></textarea>
                            <button type="submit" disabled={tProcessing} className="btn-indigo w-full !py-2 text-[10px] uppercase font-black tracking-widest"><Save className="w-3.5 h-3.5" /> Save Template</button>
                        </form>
                    </section>

                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Saved Content</h3>
                        {templates.map(t => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-slate-700">{t.title}</h4>
                                    <button onClick={() => router.delete(route('admin.broadcast.template.destroy', t.id))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                                <p className="text-[9px] text-slate-400 line-clamp-2 mb-3 font-mono leading-tight">{t.message}</p>
                                <button onClick={() => useTemplate(t)} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Use Template</button>
                            </div>
                        ))}
                        {templates.length === 0 && <div className="text-center py-10 text-slate-300 text-[10px] font-bold uppercase italic tracking-widest">No templates yet</div>}
                    </div>
                </div>

                {/* RIGHT: LIVE BROADCAST */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                    <Megaphone className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-widest">Global Blast</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-slate-400">{total_users} Users Reachable</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={sendBlast} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Live Composer (HTML Supported)</label>
                                <textarea 
                                    value={data.message} 
                                    onChange={e => setData('message', e.target.value)} 
                                    className="w-full h-80 bg-white/5 border border-white/10 rounded-[2rem] p-8 font-mono text-sm text-indigo-100 placeholder:text-slate-600 focus:ring-4 focus:ring-indigo-500/20 transition-all leading-relaxed"
                                    placeholder="✨ <b>PROMO SULTAN</b> ✨\n\nWrite your message here..."
                                    required
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 group active:scale-95"
                                >
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    <span className="uppercase tracking-[0.2em] text-sm">Initiate Broadcast</span>
                                </button>
                                <button type="button" onClick={() => reset()} className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Clear</button>
                            </div>
                        </form>
                    </section>

                    <div className="premium-card bg-slate-50 border-none">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><CheckCircle className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Broadcast Best Practices</h4>
                                <ul className="text-[10px] text-slate-500 space-y-1 font-medium list-disc ml-4">
                                    <li>Use HTML tags like <b>&lt;b&gt;</b> for bold and <b>&lt;code&gt;</b> for links.</li>
                                    <li>Add plenty of emojis to make the message pop.</li>
                                    <li>Include a clear Call to Action (e.g., Click /start).</li>
                                    <li>Avoid sending too many blasts in a short period to prevent spam blocks.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
