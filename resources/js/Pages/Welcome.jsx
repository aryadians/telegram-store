import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, ShieldCheck, MessageSquare, ArrowRight, Phone } from 'lucide-react';

export default function Welcome({ auth, settings = {} }) {
    
    const heroTitle = settings.hero_title || 'Sell digital assets faster than light.';
    const heroSubtitle = settings.hero_subtitle || 'Integration with Telegram and Duitku for a seamless experience.';
    const storeName = settings.store_name || 'Zona Akun Premium';
    const wa = settings.admin_whatsapp || '';
    const ig = settings.admin_instagram || '';

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden selection:bg-indigo-100">
            <Head title={storeName} />
            
            <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <img src="/logostore.png" className="w-10 h-10 rounded-xl shadow-lg" alt="Logo" />
                    <span className="font-black text-xl tracking-tighter">{storeName}</span>
                </div>
                <div className="flex items-center gap-6 text-sm font-bold">
                    {auth.user ? <Link href={route('dashboard')} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl hover:shadow-xl transition-all">Console</Link> : <Link href={route('login')} className="px-6 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-black transition-all">Admin Access</Link>}
                </div>
            </nav>

            <main className="relative z-10 pt-20 pb-32">
                <div className="max-w-5xl mx-auto text-center px-6">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">{heroTitle}</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">{heroSubtitle}</motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <a href="https://t.me/zona_akun_premium_bot" target="_blank" className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all">
                            <MessageSquare className="w-6 h-6" /> Open Telegram Bot <ArrowRight className="w-5 h-5" />
                        </a>
                    </motion.div>
                </div>
            </main>

            <footer className="relative z-10 border-t border-slate-100 bg-white/50 backdrop-blur-xl py-12">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">© 2026 {storeName} — Enterprise Grade</div>
                    <div className="flex gap-4">
                        {wa && <a href={`https://wa.me/${wa}`} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 hover:text-emerald-500 transition-all shadow-sm"><Phone className="w-5 h-5" /></a>}
                        {ig && <a href={`https://instagram.com/${ig}`} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 hover:text-rose-500 transition-all shadow-sm"><Instagram className="w-5 h-5" /></a>}
                    </div>
                </div>
            </footer>
        </div>
    );
}
