import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Save, Layout, Megaphone, CreditCard, 
    Gem, FileText, Database, Download, Sparkles,
    Phone, Share2, Trash2, Activity, ShieldAlert, Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';

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
        // APEX UPDATES
        maintenance_mode: settings.maintenance_mode || '0',
        bot_banner_url: settings.bot_banner_url || '',
    });

    const checkWebhook = () => {
        Swal.fire({ title: 'Diagnosing Webhook...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        router.post(route('admin.settings.webhook-check'), {}, {
            onSuccess: (page) => {
                Swal.fire({ title: 'Webhook Healthy!', text: 'System connected to Telegram Servers.', icon: 'success' });
            },
            onError: () => Swal.fire({ title: 'Webhook Error', text: 'Please check your BOT_TOKEN and URL.', icon: 'error' })
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => Swal.fire({ title: 'Apex Synced!', icon: 'success', customClass: { popup: 'rounded-2xl' } })
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Apex Control</h2>
                        <p className="text-xs text-slate-400 font-medium">Full Empire Authority</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={checkWebhook} className="btn-primary !bg-slate-800 !py-2 !px-4"><Activity className="w-4 h-4" /> Diagnostics</button>
                        <a href={route('admin.settings.backup')} className="btn-primary !py-2 !px-4 !bg-emerald-600"><Database className="w-4 h-4" /> Backup</a>
                    </div>
                </div>
            }
        >
            <Head title="Apex Settings" />

            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <form onSubmit={submit} className="space-y-8">
                    
                    {/* EMERGENCY & RESILIENCE */}
                    <div className="premium-card !p-0 overflow-hidden border-rose-100 bg-rose-50/20">
                        <div className="bg-rose-50 px-8 py-4 border-b border-rose-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-black text-[10px] uppercase text-rose-700 tracking-widest"><ShieldAlert className="w-4 h-4" /> System Resilience</div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-rose-600 uppercase">Maintenance Mode</span>
                                <input type="checkbox" checked={data.maintenance_mode === '1'} onChange={e => setData('maintenance_mode', e.target.checked ? '1' : '0')} className="rounded text-rose-600" />
                            </div>
                        </div>
                    </div>

                    {/* MEDIA & BRANDING */}
                    <div className="premium-card !p-0 overflow-hidden border-indigo-100">
                        <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex items-center gap-2 font-black text-[10px] uppercase text-indigo-700 tracking-widest"><ImageIcon className="w-4 h-4" /> Media Assets</div>
                        <div className="p-8 space-y-4">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Bot Global Banner (URL Image)</label>
                            <input type="text" value={data.bot_banner_url} onChange={e => setData('bot_banner_url', e.target.value)} className="input-field font-mono text-xs" placeholder="https://..." />
                        </div>
                    </div>

                    {/* CMS LANDING */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 font-black text-[10px] uppercase text-slate-600 tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Dynamic Landing Page</div>
                        <div className="p-8 space-y-4">
                            <input type="text" value={data.hero_title} onChange={e => setData('hero_title', e.target.value)} className="input-field font-black" placeholder="Hero Title" />
                            <textarea value={data.hero_subtitle} onChange={e => setData('hero_subtitle', e.target.value)} className="input-field h-24" placeholder="Hero Subtitle"></textarea>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-indigo w-full !py-4 uppercase font-black tracking-[0.2em] shadow-2xl">Save Apex Overrides</button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
