import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Save, Layout, Megaphone, CreditCard, 
    Gem, FileText, Shield, CheckCircle, Database, Download, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings.store_name || '',
        admin_chat_id: settings.admin_chat_id || '',
        testi_channel_id: settings.testi_channel_id || '',
        admin_whatsapp: settings.admin_whatsapp || '',
        manual_payment_enabled: settings.manual_payment_enabled || '0',
        manual_payment_details: settings.manual_payment_details || '',
        vip_threshold: settings.vip_threshold || '1000000',
        vip_discount: settings.vip_discount || '5',
        welcome_message: settings.welcome_message || '',
        template_guide: settings.template_guide || '',
        template_warranty: settings.template_warranty || '',
        template_success: settings.template_success || '',
        // CMS LANDING PAGE
        hero_title: settings.hero_title || 'Sell digital assets faster than light.',
        hero_subtitle: settings.hero_subtitle || 'Integration with Telegram and Duitku for a seamless experience.',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                Swal.fire({ title: 'Synced!', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Core</h2>
                        <p className="text-xs text-slate-400 font-medium">Platform Global Overrides</p>
                    </div>
                    <a href={route('admin.settings.backup')} className="btn-primary !py-2 !px-4 bg-emerald-600 hover:bg-emerald-700">
                        <Database className="w-4 h-4" /> Download Backup (.sql)
                    </a>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <form onSubmit={submit} className="space-y-8">
                    
                    {/* WEBSITE CMS */}
                    <div className="premium-card !p-0 overflow-hidden border-indigo-100">
                        <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Website Hero CMS</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Hero Main Title</label>
                                <input type="text" value={data.hero_title} onChange={e => setData('hero_title', e.target.value)} className="input-field font-black" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Hero Description</label>
                                <textarea value={data.hero_subtitle} onChange={e => setData('hero_subtitle', e.target.value)} className="input-field h-24 text-sm"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* BOT IDENTITY */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2"><Layout className="w-4 h-4 text-indigo-600" /><h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Global Branding</h3></div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Store Name</label><input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="input-field font-bold" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Admin Chat ID</label><input type="text" value={data.admin_chat_id} onChange={e => setData('admin_chat_id', e.target.value)} className="input-field font-mono" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Testimonial Channel ID</label><input type="text" value={data.testi_channel_id} onChange={e => setData('testi_channel_id', e.target.value)} className="input-field font-mono" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">WhatsApp Admin</label><input type="text" value={data.admin_whatsapp} onChange={e => setData('admin_whatsapp', e.target.value)} className="input-field" /></div>
                        </div>
                    </div>

                    {/* PAYMENT MODES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card !p-0 overflow-hidden border-emerald-100">
                            <div className="bg-emerald-50 px-8 py-4 border-b border-emerald-100 flex items-center justify-between">
                                <h3 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-4 h-4" /> Manual Fallback</h3>
                                <input type="checkbox" checked={data.manual_payment_enabled === '1'} onChange={e => setData('manual_payment_enabled', e.target.checked ? '1' : '0')} className="rounded text-emerald-600" />
                            </div>
                            <div className="p-6 space-y-4">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Payment Info</label>
                                <textarea value={data.manual_payment_details} onChange={e => setData('manual_payment_details', e.target.value)} className="input-field h-24 text-[10px]" placeholder="Transfer details..."></textarea>
                            </div>
                        </div>
                        <div className="premium-card !p-0 overflow-hidden border-amber-100">
                            <div className="bg-amber-50 px-8 py-4 border-b border-amber-100 flex items-center gap-2 font-bold text-[10px] uppercase text-amber-700 tracking-widest"><Gem className="w-4 h-4" /> Loyalty Tiering</div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">VIP Threshold</label><input type="number" value={data.vip_threshold} onChange={e => setData('vip_threshold', e.target.value)} className="input-field text-[10px]" /></div>
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">VIP Disc (%)</label><input type="number" value={data.vip_discount} onChange={e => setData('vip_discount', e.target.value)} className="input-field text-[10px]" /></div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-indigo w-full !py-4 text-sm tracking-widest uppercase shadow-xl shadow-indigo-100">
                        <Save className="w-4 h-4" /> Synchronize All System Parameters
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
