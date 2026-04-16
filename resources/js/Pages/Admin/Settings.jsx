import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Settings as SettingsIcon, Save, Info, MessageSquare, 
    Phone, Percent, ShieldCheck, Image, Clock, 
    AlertTriangle, Wallet, Layout
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings.store_name || 'Zona Akun Premium',
        admin_telegram: settings.admin_telegram || '@AdminStore',
        admin_whatsapp: settings.admin_whatsapp || '628123456789',
        referral_bonus: settings.referral_bonus || '5',
        admin_chat_id: settings.admin_chat_id || '',
        maintenance_mode: settings.maintenance_mode || '0',
        bot_banner_url: settings.bot_banner_url || '',
        min_deposit: settings.min_deposit || '10000',
        transaction_expiry: settings.transaction_expiry || '24',
        welcome_text: settings.welcome_message || 'Solusi instan kebutuhan digital Anda.',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'System Reconfigured',
                    text: 'Changes are now live across all platforms.',
                    icon: 'success',
                    customClass: { popup: 'rounded-[3rem]' }
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Command Center</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Global overrides & core engine settings</p>
                </div>
            }
        >
            <Head title="Settings" />

            <div className="max-w-6xl mx-auto py-12">
                <form onSubmit={submit} className="space-y-12">
                    
                    {/* SECTION 1: IDENTITY & BRANDING */}
                    <section className="premium-card !p-0 overflow-hidden">
                        <div className="bg-[#0F172A] p-8 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Layout className="w-6 h-6 text-indigo-400" />
                                <h3 className="text-lg font-black uppercase tracking-widest">Identity & Branding</h3>
                            </div>
                            {data.maintenance_mode === '1' && (
                                <div className="px-4 py-1 bg-rose-500 rounded-full text-[10px] font-black animate-pulse uppercase">Maintenance Active</div>
                            )}
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Store Display Name</label>
                                <input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="input-field" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Maintenance Mode</label>
                                <select value={data.maintenance_mode} onChange={e => setData('maintenance_mode', e.target.value)} className="input-field">
                                    <option value="0">OFF - Store is Live</option>
                                    <option value="1">ON - Store Under Maintenance</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bot Banner Image URL</label>
                                <div className="relative">
                                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input type="text" value={data.bot_banner_url} onChange={e => setData('bot_banner_url', e.target.value)} className="input-field pl-12" placeholder="https://image-link.com/banner.jpg" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Custom Welcome Text</label>
                                <textarea value={data.welcome_text} onChange={e => setData('welcome_text', e.target.value)} className="input-field h-32 py-4" placeholder="Hello! Welcome to our premium store..."></textarea>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: BUSINESS LOGIC */}
                    <section className="premium-card !p-0 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white flex items-center gap-4">
                            <Wallet className="w-6 h-6 text-indigo-200" />
                            <h3 className="text-lg font-black uppercase tracking-widest">Business & Payments</h3>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Percent className="w-3 h-3 text-indigo-600"/> Referral Bonus (%)</label>
                                <input type="number" value={data.referral_bonus} onChange={e => setData('referral_bonus', e.target.value)} className="input-field" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Wallet className="w-3 h-3 text-indigo-600"/> Min. Deposit (IDR)</label>
                                <input type="number" value={data.min_deposit} onChange={e => setData('min_deposit', e.target.value)} className="input-field" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Clock className="w-3 h-3 text-indigo-600"/> Order Expiry (Hours)</label>
                                <input type="number" value={data.transaction_expiry} onChange={e => setData('transaction_expiry', e.target.value)} className="input-field" />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: ADMIN CONTACTS */}
                    <section className="premium-card !p-0 overflow-hidden">
                        <div className="bg-slate-100 p-8 text-slate-800 flex items-center gap-4 border-b border-slate-200">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-lg font-black uppercase tracking-widest">Support & Security</h3>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin Telegram Username</label>
                                <input type="text" value={data.admin_telegram} onChange={e => setData('admin_telegram', e.target.value)} className="input-field" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin WhatsApp Number</label>
                                <input type="text" value={data.admin_whatsapp} onChange={e => setData('admin_whatsapp', e.target.value)} className="input-field" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin Telegram Chat ID (For Alerts)</label>
                                <input type="text" value={data.admin_chat_id} onChange={e => setData('admin_chat_id', e.target.value)} className="input-field font-mono" placeholder="Gunakan @userinfobot untuk cek ID Anda" />
                            </div>
                        </div>
                    </section>

                    <button type="submit" disabled={processing} className="btn-indigo w-full py-8 text-2xl shadow-2xl shadow-indigo-300">
                        <Save className="w-8 h-8" /> Synchronize All Systems
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
