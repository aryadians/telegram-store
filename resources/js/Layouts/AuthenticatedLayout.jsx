import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LayoutDashboard, ShoppingBag, FolderTree, Megaphone, Database, History, User } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { name: 'Products', href: route('admin.products'), icon: ShoppingBag, active: route().current('admin.products') },
        { name: 'Categories', href: route('admin.categories'), icon: FolderTree, active: route().current('admin.categories') },
        { name: 'Broadcast', href: route('admin.broadcast'), icon: Megaphone, active: route().current('admin.broadcast') },
        { name: 'Stock Opname', href: route('admin.stock-opname'), icon: Database, active: route().current('admin.stock-opname') },
        { name: 'Transactions', href: route('admin.transactions'), icon: History, active: route().current('admin.transactions') },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <div className="p-2 bg-indigo-600 rounded-xl group-hover:rotate-12 transition-all">
                                        <ShoppingBag className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-gray-900">Zona<span className="text-indigo-600">Akun</span></span>
                                </Link>
                            </div>

                            <div className="hidden space-x-4 sm:-my-px sm:ms-10 sm:flex">
                                {navItems.map((item) => (
                                    <NavLink 
                                        key={item.name} 
                                        href={item.href} 
                                        active={item.active}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none"
                                    >
                                        <item.icon className={`w-4 h-4 me-2 ${item.active ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full bg-gray-50 hover:bg-gray-100 transition">
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Sign Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-gray-100">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="pb-20">{children}</main>
        </div>
    );
}
