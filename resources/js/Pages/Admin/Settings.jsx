import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Save, Layout, Megaphone, CreditCard, 
    Gem, FileText, Database, Download, Sparkles,
    Phone, Share2, Trash2, Activity, ShieldAlert, Image as ImageIcon,
    Globe, Smartphone, Bell, Heart, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings.store_name || '',
        admin_chat_id: settings.admin_chat_id || '',
        testi_channel_id: settings.testi_channel_id || '',
        admin_whatsapp: settings.admin_whatsapp || '',
        admin_instagram: settings.admin_instagram || '',
        manual_payment_enabled: settings.manual_payment_enabled || '0',
        manual_payment_details: settings.manual_payment_details || '',
        vip_threshold: settings.vip_threshold || '1000000',
        vip_discount: settings.vip_discount || '5',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        maintenance_mode: settings.maintenance_mode || '0',
        bot_banner_url: settings.bot_banner_url || '',
        template_guide: settings.template_guide || '',
        template_warranty: settings.template_warranty || '',
    });

    const checkWebhook = () => {
        Swal.fire({ title: 'Diagnosing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        router.post(route('admin.settings.webhook-check'), {}, {
            onSuccess: () => Swal.fire({ title: 'Connection Stable', text: 'Webhook is active.', icon: 'success' }),
            onError: () => Swal.fire({ title: 'Connection Error', icon: 'error' })
        });
    };

    const handleCleanup = () => {
        Swal.fire({
            title: 'Purge Unpaid Data?',
            text: 'System will delete invoices older than 24h.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
        }).then((result) => {
            if (result.isConfirmed) router.post(route('admin.settings.cleanup'));
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => Swal.fire({ title: 'Apex Synced!', icon: 'success', customClass: { popup: 'rounded-3xl' } })
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Core</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Configuration Suite</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={checkWebhook} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-all shadow-sm"><Activity className="w-5 h-5" /></button>
                        <button onClick={handleCleanup} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-rose-500 transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                        <a href={route('admin.settings.backup')} className="btn-primary !bg-emerald-600 !py-2.5 !px-5 shadow-lg shadow-emerald-100"><Database className="w-4 h-4" /> Backup SQL</a>
                    </div>
                </div>
            }
        >
            <Head title="System Core" />

            <div className="max-w-6xl mx-auto pb-32">
                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: BRANDING & CMS */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. IDENTITY & CMS */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-100 flex items-center gap-3">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Web Identity & CMS</h3>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                                        <input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="input-field !py-3 font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin UID</label>
                                        <input type="text" value={data.admin_chat_id} onChange={e => setData('admin_chat_id', e.target.value)} className="input-field !py-3 font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">Hero Main Title <Sparkles className="w-3 h-3 text-amber-500" /></label>
                                        <input type="text" value={data.hero_title} onChange={e => setData('hero_title', e.target.value)} className="input-field !py-3 font-black text-slate-800" placeholder="e.g. Sell digital assets faster..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Subtitle</label>
                                        <textarea value={data.hero_subtitle} onChange={e => setData('hero_subtitle', e.target.value)} className="input-field h-24 text-sm leading-relaxed" placeholder="Describe your store value..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. BOT ENGINE CONFIG */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-100 flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bot Intelligence Engine</h3>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Bot Banner (Image URL)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input type="text" value={data.bot_banner_url} onChange={e => setData('bot_banner_url', e.target.value)} className="input-field pl-12 font-mono text-xs" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><FileText className="w-3 h-3" /> Order Guide Template</label>
                                        <textarea value={data.template_guide} onChange={e => setData('template_guide', e.target.value)} className="input-field h-40 font-mono text-[10px] bg-slate-50/50 border-none"></textarea>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Warranty Template</label>
                                        <textarea value={data.template_warranty} onChange={e => setData('template_warranty', e.target.value)} className="input-field h-40 font-mono text-[10px] bg-slate-50/50 border-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: REVENUE & SECURITY */}
                    <div className="space-y-8">
                        
                        {/* 3. RESILIENCE CONTROL */}
                        <section className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-500/30">
                                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Resilience</h3>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                                    <span className="text-[9px] font-black uppercase opacity-60">Maintenance</span>
                                    <input 
                                        type="checkbox" 
                                        checked={data.maintenance_mode === '1'} 
                                        onChange={e => setData('maintenance_mode', e.target.checked ? '1' : '0')} 
                                        className="rounded-lg w-5 h-5 bg-transparent border-white/20 text-rose-500 focus:ring-0"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                Maintenance mode shuts down the Bot for all users except the Admin UID. Use it during massive stock injections.
                            </p>
                        </section>

                        {/* 4. REVENUE & LOYALTY */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-amber-50/50 px-8 py-5 border-b border-amber-50 flex items-center gap-3">
                                <Gem className="w-4 h-4 text-amber-600" />
                                <h3 className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Growth & Loyalty</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">VIP Threshold (Rp)</label>
                                    <input type="number" value={data.vip_threshold} onChange={e => setData('vip_threshold', e.target.value)} className="input-field !py-2.5 font-black" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">VIP Discount (%)</label>
                                    <input type="number" value={data.vip_discount} onChange={e => setData('vip_discount', e.target.value)} className="input-field !py-2.5 font-black text-indigo-600" />
                                </div>
                            </div>
                        </section>

                        {/* 5. CONNECTIVITY */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-indigo-50/50 px-8 py-5 border-b border-indigo-50 flex items-center gap-3">
                                <Share2 className="w-4 h-4 text-indigo-600" />
                                <h3 className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Connectivity</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Admin</label>
                                    <input type="text" value={data.admin_whatsapp} onChange={e => setData('admin_whatsapp', e.target.value)} className="input-field !py-2.5 font-bold" placeholder="62812..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Testimonial Channel ID</label>
                                    <input type="text" value={data.testi_channel_id} onChange={e => setData('testi_channel_id', e.target.value)} className="input-field !py-2.5 font-mono text-xs" />
                                </div>
                            </div>
                        </section>

                        {/* SAVE ACTION */}
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full bg-[#0F172A] text-white font-black py-6 rounded-[2rem] hover:bg-black transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-indigo-100 active:scale-95"
                        >
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-[0.2em] text-xs">Sync Parameters</span>
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
