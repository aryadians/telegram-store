import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, ArrowRight, Phone, ShieldCheck, 
    Zap, Coffee, ShoppingBag, Star, Users, Globe 
} from 'lucide-react';

export default function Welcome({ auth, settings = {} }) {
    
    const heroTitle = settings.hero_title || 'Elevate Your Digital FnB Experience.';
    const heroSubtitle = settings.hero_subtitle || 'The fastest, most automated way to access premium FnB accounts. Integrated with Telegram for instant delivery.';
    const storeName = settings.store_name || 'Zona Akun Premium';
    const wa = settings.admin_whatsapp || '';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 font-sans">
            <Head title={`${storeName} — Premium Digital Assets`} />
            
            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-blue-200/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* NAV BAR */}
            <nav className="relative z-50 flex justify-between items-center px-8 md:px-12 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden">
                        <img src="/logostore.png" className="w-full h-full object-cover rounded-lg" alt="Logo" />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase">{storeName}</span>
                </div>
                
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs hover:shadow-xl transition-all shadow-sm">Console</Link>
                    ) : (
                        <Link href={route('login')} className="px-6 py-2.5 bg-[#0F172A] text-white rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-2xl shadow-indigo-100">Admin Access</Link>
                    )}
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="relative z-10 pt-20 pb-20 overflow-hidden">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto text-center px-6"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 mb-8">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Enterprise Digital Gateway</span>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-10 text-slate-900"
                    >
                        {heroTitle}
                    </motion.h1>

                    <motion.p 
                        variants={itemVariants}
                        className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-14 leading-relaxed"
                    >
                        {heroSubtitle}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="https://t.me/zona_akun_premium_bot" target="_blank" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all group active:scale-95">
                            <MessageSquare className="w-6 h-6" /> Launch Bot <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            Learn Features
                        </button>
                    </motion.div>
                </motion.div>
            </main>

            {/* TRUST STRIP */}
            <div className="relative z-10 border-y border-slate-100 bg-white/40 backdrop-blur-sm py-12">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <TrustStat label="Active Users" val="12,400+" icon={Users} />
                    <TrustStat label="Success Rate" val="99.9%" icon={ShieldCheck} />
                    <TrustStat label="Avg Delivery" val="< 2 Sec" icon={Zap} />
                    <TrustStat label="Global Reach" val="24/7" icon={Globe} />
                </div>
            </div>

            {/* FEATURE GRID */}
            <section className="relative z-10 py-32 max-w-7xl mx-auto px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Why we are different.</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Engineered for reliability</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={Zap} 
                        title="Atomic Delivery" 
                        desc="No waiting in lines. Our system detects payment and delivers your account data in less than 2 seconds."
                    />
                    <FeatureCard 
                        icon={Coffee} 
                        title="FnB Specialist" 
                        desc="Curated selection of premium accounts from Kopi Kenangan, Tomoro, Fore, KFC, and more."
                        highlight={true}
                    />
                    <FeatureCard 
                        icon={ShieldCheck} 
                        title="Guaranteed Quality" 
                        desc="Every account is manually verified and backed by our automated 24/7 warranty system."
                    />
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative z-10 py-20 px-8">
                <div className="max-w-5xl mx-auto bg-[#0F172A] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Ready to join the <br/><span className="text-indigo-400">Empire of Sultan?</span></h2>
                        <a href="https://t.me/zona_akun_premium_bot" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-[#0F172A] rounded-[2rem] font-black text-xl hover:bg-slate-100 transition-all shadow-xl active:scale-95">
                            Open Telegram Bot
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 pt-32 pb-16 border-t border-slate-100 bg-white/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/logostore.png" className="w-8 h-8 rounded-lg shadow-md" alt="Logo" />
                            <span className="font-black tracking-tighter uppercase text-sm text-slate-800">{storeName}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Managed by Digital Empire Systems</p>
                    </div>

                    <div className="flex gap-4">
                        {wa && (
                            <a href={`https://wa.me/${wa}`} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                                <Phone className="w-4 h-4" /> Support
                            </a>
                        )}
                        <a href="https://t.me/zona_akun_premium_bot" className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                            <ShoppingBag className="w-4 h-4" /> Catalog
                        </a>
                    </div>
                </div>
                <div className="text-center mt-20 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2026 {storeName} — Apex Edition</div>
            </footer>
        </div>
    );
}

function TrustStat({ label, val, icon: Icon }) {
    return (
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Icon className="w-5 h-5 text-indigo-500 mb-2 opacity-50" />
            <div className="text-2xl font-black text-slate-800 leading-none mb-1">{val}</div>
            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, highlight = false }) {
    return (
        <div className={`p-10 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:shadow-indigo-100 group ${highlight ? 'bg-[#0F172A] border-slate-800 text-white md:scale-110 shadow-2xl' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${highlight ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-100'}`}>
                <Icon className={`w-7 h-7 ${highlight ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <h3 className="text-xl font-black mb-4 tracking-tight uppercase">{title}</h3>
            <p className={`text-sm leading-relaxed font-medium ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
        </div>
    );
}
