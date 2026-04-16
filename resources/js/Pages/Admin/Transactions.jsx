import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, Calendar, User, ShoppingBag, CreditCard, ExternalLink } from 'lucide-react';

export default function Transactions({ auth, transactions }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-gray-800 tracking-tight">Transaction History</h2>}
        >
            <Head title="Transactions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-xl shadow-gray-100 sm:rounded-3xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                        <th className="py-6 px-8">Transaction Info</th>
                                        <th className="py-6 px-8">User</th>
                                        <th className="py-6 px-8">Product</th>
                                        <th className="py-6 px-8">Amount</th>
                                        <th className="py-6 px-8">Status</th>
                                        <th className="py-6 px-8">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions.data.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                        <CreditCard className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-gray-600">{tx.reference}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                    <User className="w-3 h-3 opacity-40" /> {tx.chat_id}
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-2 font-bold text-gray-800 uppercase text-xs">
                                                    <ShoppingBag className="w-3 h-3 text-indigo-500" /> {tx.product.name}
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className="text-sm font-black text-gray-900 leading-none">Rp {Number(tx.amount).toLocaleString()}</span>
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                                    tx.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    <span className={`w-1.2 h-1.2 rounded-full ${tx.status === 'PAID' ? 'bg-green-500' : tx.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    <Calendar className="w-3 h-3" /> {new Date(tx.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Professional Pagination */}
                        <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Results {transactions.from}-{transactions.to} of {transactions.total}
                            </div>
                            <div className="flex gap-2">
                                {transactions.links.map((link, i) => (
                                    <button 
                                        key={i}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-4 py-2 text-xs font-black rounded-xl border transition-all ${
                                            link.active 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                                        } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                        onClick={() => link.url && (window.location.href = link.url)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
