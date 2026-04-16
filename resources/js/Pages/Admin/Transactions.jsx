import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Transactions({ auth, transactions }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Transactions</h2>}
        >
            <Head title="Transactions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Reference</th>
                                        <th className="py-2">Chat ID</th>
                                        <th className="py-2">Product</th>
                                        <th className="py-2">Amount</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((tx) => (
                                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 text-sm font-mono">{tx.reference}</td>
                                            <td className="py-3 text-sm">{tx.chat_id}</td>
                                            <td className="py-3 font-medium">{tx.product.name}</td>
                                            <td className="py-3">Rp {tx.amount.toLocaleString()}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    tx.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                                    tx.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-gray-500">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Simple Pagination */}
                            <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
                                <div>Showing {transactions.from} to {transactions.to} of {transactions.total} results</div>
                                <div className="space-x-2">
                                    {transactions.links.map((link, i) => (
                                        <button 
                                            key={i}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 border rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white'} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                            onClick={() => link.url && (window.location.href = link.url)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
