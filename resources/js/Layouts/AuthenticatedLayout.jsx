import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, ShoppingBag, FolderTree, Megaphone, 
    Database, History, User, Ticket, Settings, 
    Menu, X, ChevronRight, LogOut, Settings2, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsSidebarOpen(!mobile);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { name: 'Products', href: route('admin.products'), icon: ShoppingBag, active: route().current('admin.products') },
        { name: 'Categories', href: route('admin.categories'), icon: FolderTree, active: route().current('admin.categories') },
        { name: 'Broadcast', href: route('admin.broadcast'), icon: Megaphone, active: route().current('admin.broadcast') },
        { name: 'Stock Injection', href: route('admin.stock-opname'), icon: Database, active: route().current('admin.stock-opname') },
        { name: 'User CRM', href: route('admin.users'), icon: User, active: route().current('admin.users') },
        { name: 'FAQ Manager', href: route('admin.faqs'), icon: Ticket, active: route().current('admin.faqs') },
        { name: 'Voucher Factory', href: route('admin.vouchers'), icon: Ticket, active: route().current('admin.vouchers') },
        { name: 'System Core', href: route('admin.settings'), icon: Settings, active: route().current('admin.settings') },
        { name: 'Transaction Logs', href: route('admin.transactions'), icon: History, active: route().current('admin.transactions') },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
            {/* MOBILE BACKDROP */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside 
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                        className="fixed lg:relative z-50 w-[280px] sm:w-80 h-screen bg-[#0F172A] text-white flex flex-col shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] shrink-0"
                    >
                        {/* Logo Area */}
                        <div className="p-6 sm:p-10 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 p-1.5 bg-white rounded-2xl overflow-hidden shadow-2xl group-hover:rotate-6 transition-all duration-500 text-center flex items-center justify-center">
                                    <img src="/logostore.png" className="w-full h-full object-cover rounded-xl" alt="Logo" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-lg sm:text-xl tracking-tighter leading-none">Zona<span className="text-indigo-400">Akun</span></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Premium Store</span>
                                </div>
                            </Link>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                                <ChevronLeft className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Nav Items */}
                        <nav className="flex-1 px-4 sm:px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-4 mb-6">Management Console</div>
                            {navItems.map((item) => (
                                <Link 
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => isMobile && setIsSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-[1.2rem] sm:rounded-[1.5rem] transition-all duration-300 group ${
                                        item.active 
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-all duration-300 ${item.active ? 'scale-110' : 'group-hover:text-indigo-400'}`} />
                                    <span className={`font-bold text-xs sm:text-sm tracking-tight ${item.active ? 'opacity-100' : 'opacity-80'}`}>{item.name}</span>
                                    {item.active && (
                                        <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Footer / Logout */}
                        <div className="p-6 sm:p-8 border-t border-white/5 bg-black/20">
                            <div className="flex items-center gap-4 mb-6 sm:mb-8 px-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-xs sm:text-sm truncate uppercase tracking-tight">{user.name}</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                            <Link 
                                href={route('logout')} 
                                method="post" 
                                as="button" 
                                className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-sm"
                            >
                                <LogOut className="w-4 h-4" /> Terminate Session
                            </Link>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Modern Top Bar */}
                <header className="h-20 sm:h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-40">
                    <div className="flex items-center gap-4 sm:gap-8">
                        {!isSidebarOpen && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)} 
                                className="p-3 sm:p-4 bg-white border border-slate-200 rounded-[1rem] sm:rounded-[1.2rem] hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 group active:scale-90"
                            >
                                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                        <div className="animate-in fade-in slide-in-from-left-4 duration-700 w-full overflow-hidden">
                            {header}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-4">
                        <Link 
                            href={route('admin.settings')}
                            className="p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all duration-300 shadow-sm hidden sm:flex"
                        >
                            <Settings2 className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar relative">
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
