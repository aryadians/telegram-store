import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, ShoppingBag, FolderTree, Megaphone, 
    Database, History, User, Ticket, Settings, 
    Menu, ChevronRight, LogOut, Settings2, ChevronLeft
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
        { name: 'Vouchers', href: route('admin.vouchers'), icon: Ticket, active: route().current('admin.vouchers') },
        { name: 'FAQ Manager', href: route('admin.faqs'), icon: Ticket, active: route().current('admin.faqs') },
        { name: 'System Core', href: route('admin.settings'), icon: Settings, active: route().current('admin.settings') },
        { name: 'System Logs', href: route('admin.logs'), icon: Terminal, active: route().current('admin.logs') },
        { name: 'Transactions', href: route('admin.transactions'), icon: History, active: route().current('admin.transactions') },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.2 }} className="fixed lg:relative z-50 w-72 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <img src="/logostore.png" className="w-8 h-8 rounded-lg" alt="Logo" />
                                <span className="font-bold text-slate-800">Zona<span className="text-indigo-600">Admin</span></span>
                            </Link>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link key={item.name} href={item.href} onClick={() => isMobile && setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${item.active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                    <item.icon className={`w-4 h-4 ${item.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                            <Link href={route('logout')} method="post" as="button" className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 font-bold text-xs hover:bg-rose-50 rounded-lg transition-all"><LogOut className="w-4 h-4" /> Sign Out</Link>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><Menu className="w-5 h-5 text-slate-600" /></button>
                        )}
                        <div className="truncate">{header}</div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
