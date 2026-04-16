import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, ShieldCheck, MessageSquare, ArrowRight } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden selection:bg-indigo-100">
            <Head title="Premium Store Automation" />
            
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-blue-200/20 blur-[100px] rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter">Zona<span className="text-indigo-600">Akun</span></span>
                </div>
                
                <div className="flex items-center gap-6">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:shadow-xl transition-all">Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="font-bold text-sm text-gray-500 hover:text-gray-900 transition">Login</Link>
                            <Link href={route('register')} className="px-6 py-2.5 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-black transition-all">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-20 pb-32">
                <div className="max-w-5xl mx-auto text-center px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100"
                    >
                        <Zap className="w-3 h-3 fill-indigo-600" /> Automated Delivery 24/7
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8"
                    >
                        Sell digital assets <br/>
                        <span className="text-indigo-600">faster than light.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Integration with Telegram and Duitku for a seamless payment & delivery experience. No more manual chats, just set your stock and let us do the rest.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <a href="https://t.me/your_bot_username" target="_blank" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 group">
                            <MessageSquare className="w-6 h-6" /> Open Telegram Bot
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </main>

            {/* Features Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={Zap} 
                        title="Instant Auto-Delivery" 
                        desc="Customers receive their account details instantly after successful payment callback."
                        delay={0.4}
                    />
                    <FeatureCard 
                        icon={ShieldCheck} 
                        title="Secure Payments" 
                        desc="Enterprise-grade security using Duitku API with automatic signature verification."
                        delay={0.5}
                    />
                    <FeatureCard 
                        icon={MessageSquare} 
                        title="Telegram Native" 
                        desc="Beautiful inline keyboards and automated message handling for the best user experience."
                        delay={0.6}
                    />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, delay }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="p-10 bg-white border border-gray-100 rounded-[32px] shadow-xl shadow-gray-50 hover:shadow-2xl hover:border-indigo-100 transition-all group"
        >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <Icon className="w-7 h-7 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-black mb-3">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
        </motion.div>
    );
}
