import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Settings as SettingsIcon, Save, MessageSquare, 
    Phone, Percent, ShieldCheck, FileText, Shield, CheckCircle,
    Layout, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings.store_name || 'Zona Akun Premium',
        admin_telegram: settings.admin_telegram || '@AdminStore',
        admin_whatsapp: settings.admin_whatsapp || '628123456789',
        referral_bonus: settings.referral_bonus || '5',
        welcome_message: settings.welcome_message || 'Solusi otomatis untuk kebutuhan Akun Premium.',
        template_guide: settings.template_guide || '',
        template_warranty: settings.template_warranty || '',
        template_success: settings.template_success || '',
        admin_chat_id: settings.admin_chat_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                Swal.fire({ 
                    title: 'System Synced!', 
                    text: 'All bot templates are updated.', 
                    icon: 'success', 
                    customClass: { popup: 'rounded-[2rem]' } 
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Control Center</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configure your bot experience</p>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="max-w-5xl mx-auto py-8">
                <form onSubmit={submit} className="space-y-8">
                    
                    {/* SECTION 1: IDENTITY */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
                            <Layout className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-black uppercase text-xs tracking-[0.2em]">Bot Identity & Branding</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Store Name</label>
                                <input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="input-field" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Admin Chat ID (Alerts)</label>
                                <input type="text" value={data.admin_chat_id} onChange={e => setData('admin_chat_id', e.target.value)} className="input-field font-mono" placeholder="e.g. 123456789" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Welcome Text (Start Message)</label>
                                <textarea value={data.welcome_message} onChange={e => setData('welcome_message', e.target.value)} className="input-field h-32 py-4 leading-relaxed"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: TEMPLATES (GUIDE & WARRANTY) */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-indigo-600 p-6 text-white flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-200" />
                            <h3 className="font-black uppercase text-xs tracking-[0.2em]">Instructional Templates</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-indigo-600" /> Guide Template (Panduan Order)
                                </label>
                                <textarea value={data.template_guide} onChange={e => setData('template_guide', e.target.value)} className="input-field h-80 font-mono text-xs leading-relaxed bg-slate-50/50" placeholder="Copy paste your Guide format here..."></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-indigo-600" /> Warranty Template (Garansi)
                                </label>
                                <textarea value={data.template_warranty} onChange={e => setData('template_warranty', e.target.value)} className="input-field h-80 font-mono text-xs leading-relaxed bg-slate-50/50" placeholder="Copy paste your Warranty format here..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: SUCCESS MESSAGE */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-200" />
                            <h3 className="font-black uppercase text-xs tracking-[0.2em]">Post-Purchase Experience</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Success Message</label>
                            <textarea value={data.template_success} onChange={e => setData('template_success', e.target.value)} className="input-field h-40 font-mono text-xs leading-relaxed bg-slate-50/50" placeholder="Placeholders: [PRODUCT_NAME], [ACCOUNT_DETAILS]"></textarea>
                            <div className="flex gap-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                <span>[PRODUCT_NAME] = Dynamic Name</span>
                                <span>[ACCOUNT_DETAILS] = Account Data</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-indigo w-full py-6 text-xl shadow-xl shadow-indigo-100">
                        <Save className="w-6 h-6" /> Save & Push to Telegram
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
