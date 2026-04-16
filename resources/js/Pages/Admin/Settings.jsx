import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Info, MessageSquare, Phone, Percent, Shield, FileText, CheckCircle, Layout } from 'lucide-react';
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
                    <h2 className="text-xl font-bold text-slate-800">System Overrides</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Bot Core Configuration</p>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="max-w-5xl mx-auto space-y-8">
                <form onSubmit={submit} className="space-y-8">
                    {/* Identity */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Layout className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Bot Branding</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Store Label</label><input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="input-field !py-2.5 text-xs font-bold" /></div>
                            <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin UID</label><input type="text" value={data.admin_chat_id} onChange={e => setData('admin_chat_id', e.target.value)} className="input-field !py-2.5 text-xs font-mono" /></div>
                            <div className="md:col-span-2 space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bot Bio (Start Message)</label><textarea value={data.welcome_message} onChange={e => setData('welcome_message', e.target.value)} className="input-field h-24 !py-3 text-xs leading-relaxed"></textarea></div>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card !p-0 overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /><h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Guide</h3></div>
                            <div className="p-6"><textarea value={data.template_guide} onChange={e => setData('template_guide', e.target.value)} className="input-field h-64 font-mono text-[10px] leading-tight bg-slate-50 border-none shadow-inner"></textarea></div>
                        </div>
                        <div className="premium-card !p-0 overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-600" /><h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Warranty</h3></div>
                            <div className="p-6"><textarea value={data.template_warranty} onChange={e => setData('template_warranty', e.target.value)} className="input-field h-64 font-mono text-[10px] leading-tight bg-slate-50 border-none shadow-inner"></textarea></div>
                        </div>
                    </div>

                    {/* Success Template */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /><h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Purchase Success</h3></div>
                        <div className="p-8 space-y-4">
                            <textarea value={data.template_success} onChange={e => setData('template_success', e.target.value)} className="input-field h-32 font-mono text-[10px] leading-tight bg-slate-50 border-none shadow-inner"></textarea>
                            <div className="flex gap-4 text-[8px] font-bold text-slate-400 uppercase italic"><span>[PRODUCT_NAME]</span><span>[ACCOUNT_DETAILS]</span></div>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-indigo w-full !py-4 text-sm tracking-widest"><Save className="w-4 h-4" /> Save Core Configuration</button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
