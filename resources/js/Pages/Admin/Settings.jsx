import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Save, Info, MessageSquare, Phone, Percent, Shield, 
    FileText, CheckCircle, Layout, Megaphone, CreditCard, 
    Gem, Radio, Lock
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings.store_name || '',
        admin_telegram: settings.admin_telegram || '',
        admin_whatsapp: settings.admin_whatsapp || '',
        referral_bonus: settings.referral_bonus || '5',
        welcome_message: settings.welcome_message || '',
        template_guide: settings.template_guide || '',
        template_warranty: settings.template_warranty || '',
        template_success: settings.template_success || '',
        admin_chat_id: settings.admin_chat_id || '',
        testi_channel_id: settings.testi_channel_id || '',
        manual_payment_enabled: settings.manual_payment_enabled || '0',
        manual_payment_details: settings.manual_payment_details || '',
        vip_threshold: settings.vip_threshold || '1000000',
        vip_discount: settings.vip_discount || '5',
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
                <div>
                    <h2 className="text-xl font-bold text-slate-800">System Parameters</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Operational Control</p>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="max-w-5xl mx-auto space-y-8">
                <form onSubmit={submit} className="space-y-8">
                    {/* Bot Branding */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2"><Layout className="w-4 h-4 text-indigo-600" /><h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Global Branding</h3></div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Store Name</label><input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="input-field !py-2.5 text-xs font-bold" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin UID</label><input type="text" value={data.admin_chat_id} onChange={e => setData('admin_chat_id', e.target.value)} className="input-field !py-2.5 text-xs font-mono" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Megaphone className="w-3 h-3" /> Testimonial Channel ID</label><input type="text" value={data.testi_channel_id} onChange={e => setData('testi_channel_id', e.target.value)} className="input-field !py-2.5 text-xs font-mono" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Admin</label><input type="text" value={data.admin_whatsapp} onChange={e => setData('admin_whatsapp', e.target.value)} className="input-field !py-2.5 text-xs" /></div>
                        </div>
                    </div>

                    {/* Operational Modes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card !p-0 overflow-hidden border-indigo-100">
                            <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-[10px] uppercase text-indigo-700 tracking-widest"><CreditCard className="w-4 h-4" /> Manual Payment Support</div>
                                <input type="checkbox" checked={data.manual_payment_enabled === '1'} onChange={e => setData('manual_payment_enabled', e.target.checked ? '1' : '0')} className="rounded text-indigo-600" />
                            </div>
                            <div className="p-6 space-y-4">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Payment Instructions (Bank Details)</label>
                                <textarea value={data.manual_payment_details} onChange={e => setData('manual_payment_details', e.target.value)} className="input-field h-24 text-[10px] leading-relaxed" placeholder="Contoh: Transfer ke BCA 123456..."></textarea>
                            </div>
                        </div>

                        <div className="premium-card !p-0 overflow-hidden border-amber-100">
                            <div className="bg-amber-50 px-8 py-4 border-b border-amber-100 flex items-center gap-2 font-bold text-[10px] uppercase text-amber-700 tracking-widest"><Gem className="w-4 h-4" /> Loyalty Tiering</div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">VIP Threshold (Rp)</label><input type="number" value={data.vip_threshold} onChange={e => setData('vip_threshold', e.target.value)} className="input-field !py-2 text-[10px]" /></div>
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase">VIP Discount (%)</label><input type="number" value={data.vip_discount} onChange={e => setData('vip_discount', e.target.value)} className="input-field !py-2 text-[10px]" /></div>
                            </div>
                        </div>
                    </div>

                    {/* Message Factory */}
                    <div className="premium-card !p-0 overflow-hidden bg-slate-50">
                        <div className="bg-slate-200 px-8 py-4 border-b border-slate-300 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-700" /><h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Message Factory</h3></div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Guide Template</label><textarea value={data.template_guide} onChange={e => setData('template_guide', e.target.value)} className="input-field h-48 font-mono text-[10px] bg-white border-none"></textarea></div>
                                <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Warranty Template</label><textarea value={data.template_warranty} onChange={e => setData('template_warranty', e.target.value)} className="input-field h-48 font-mono text-[10px] bg-white border-none"></textarea></div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-indigo w-full !py-4 text-sm tracking-widest uppercase"><Save className="w-4 h-4" /> Save System Overrides</button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
