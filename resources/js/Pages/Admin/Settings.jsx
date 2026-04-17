import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Save, Layout, Megaphone, CreditCard, 
    Gem, FileText, Database, Download, Sparkles,
    Instagram, Phone, Share2, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings.store_name || '',
        admin_chat_id: settings.admin_chat_id || '',
        testi_channel_id: settings.testi_channel_id || '',
        admin_whatsapp: settings.admin_whatsapp || '',
        admin_instagram: settings.admin_whatsapp || '',
        manual_payment_enabled: settings.manual_payment_enabled || '0',
        manual_payment_details: settings.manual_payment_details || '',
        vip_threshold: settings.vip_threshold || '1000000',
        vip_discount: settings.vip_discount || '5',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                Swal.fire({ title: 'Synced!', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            },
        });
    };

    const handleCleanup = () => {
        Swal.fire({
            title: 'Cleanup Database?',
            text: 'This will delete unpaid invoices older than 24h.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.settings.cleanup'));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Core</h2>
                        <p className="text-xs text-slate-400 font-medium">Enterprise Configuration</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleCleanup} className="btn-primary !bg-rose-500 hover:!bg-rose-600 !py-2 !px-4">
                            <Trash2 className="w-4 h-4" /> Cleanup Data
                        </button>
                        <a href={route('admin.settings.backup')} className="btn-primary !py-2 !px-4 !bg-emerald-600 hover:!bg-emerald-700">
                            <Database className="w-4 h-4" /> Backup (.sql)
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="max-w-5xl mx-auto space-y-8 pb-20 text-sm">
                <form onSubmit={submit} className="space-y-8">
                    
                    {/* SOCIAL LINKS CMS */}
                    <div className="premium-card !p-0 overflow-hidden border-indigo-100">
                        <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex items-center gap-2 font-black text-[10px] uppercase text-indigo-700 tracking-[0.2em]"><Share2 className="w-4 h-4" /> Presence & Socials</div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">WhatsApp (Intl Format)</label>
                                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" /><input type="text" value={data.admin_whatsapp} onChange={e => setData('admin_whatsapp', e.target.value)} className="input-field pl-10" placeholder="62812xxx" /></div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Instagram Username</label>
                                <div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" /><input type="text" value={data.admin_instagram} onChange={e => setData('admin_instagram', e.target.value)} className="input-field pl-10" placeholder="username" /></div>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC LANDING */}
                    <div className="premium-card !p-0 overflow-hidden border-slate-100">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2 font-black text-[10px] uppercase text-slate-700 tracking-[0.2em]"><Sparkles className="w-4 h-4 text-amber-500" /> Website Hero CMS</div>
                        <div className="p-8 space-y-4">
                            <input type="text" value={data.hero_title} onChange={e => setData('hero_title', e.target.value)} className="input-field font-bold" placeholder="Main Title" />
                            <textarea value={data.hero_subtitle} onChange={e => setData('hero_subtitle', e.target.value)} className="input-field h-24" placeholder="Subtitle description"></textarea>
                        </div>
                    </div>

                    {/* OPERATIONALS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card !p-0 overflow-hidden border-emerald-100">
                            <div className="bg-emerald-50 px-8 py-4 border-b border-emerald-100 flex items-center justify-between font-black text-[10px] uppercase text-emerald-700 tracking-[0.15em]"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Manual Payment</div><input type="checkbox" checked={data.manual_payment_enabled === '1'} onChange={e => setData('manual_payment_enabled', e.target.checked ? '1' : '0')} className="rounded text-emerald-600" /></div>
                            <div className="p-6"><textarea value={data.manual_payment_details} onChange={e => setData('manual_payment_details', e.target.value)} className="input-field h-24 text-[10px]" placeholder="Bank account details..."></textarea></div>
                        </div>
                        <div className="premium-card !p-0 overflow-hidden border-amber-100">
                            <div className="bg-amber-50 px-8 py-4 border-b border-amber-100 flex items-center gap-2 font-black text-[10px] uppercase text-amber-700 tracking-[0.15em]"><Gem className="w-4 h-4" /> Loyalty Tiering</div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">VIP Target (Rp)</label><input type="number" value={data.vip_threshold} onChange={e => setData('vip_threshold', e.target.value)} className="input-field" /></div>
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Discount (%)</label><input type="number" value={data.vip_discount} onChange={e => setData('vip_discount', e.target.value)} className="input-field" /></div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-indigo w-full !py-4 uppercase tracking-[0.3em] font-black shadow-2xl shadow-indigo-200">
                        <Save className="w-5 h-5" /> Synchronize All Changes
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
