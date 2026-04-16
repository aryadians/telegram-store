import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, products, recentTransactions, stats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Admin</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistik Ringkasan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-green-500">
                            <div className="text-gray-500 text-sm font-medium uppercase">Total Pendapatan</div>
                            <div className="text-2xl font-bold text-gray-900">Rp {Number(stats.total_revenue).toLocaleString()}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <div className="text-gray-500 text-sm font-medium uppercase">Pesanan Sukses</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total_orders}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-yellow-500">
                            <div className="text-gray-500 text-sm font-medium uppercase">Pesanan Pending</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.pending_orders}</div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold mb-4 text-gray-700">Status Stok Produk</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="text-gray-600 text-xs font-bold truncate uppercase">{product.name}</div>
                                <div className={`text-xl font-black ${product.total_stock < 5 ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {product.total_stock} <span className="text-xs font-normal text-gray-400">tersedia</span>
                                </div>
                                {product.total_stock < 5 && <div className="text-[10px] text-red-500 italic mt-1">⚠️ Stok Menipis!</div>}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-4">10 Transaksi Terakhir</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b bg-gray-50 text-gray-600 text-sm uppercase">
                                            <th className="py-3 px-4">Ref</th>
                                            <th className="py-3 px-4">Produk</th>
                                            <th className="py-3 px-4">Amount</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="border-b hover:bg-gray-50 transition">
                                                <td className="py-3 px-4 text-sm font-mono text-gray-500">{tx.reference}</td>
                                                <td className="py-3 px-4 font-semibold text-gray-700">{tx.product.name}</td>
                                                <td className="py-3 px-4 text-gray-900 font-bold text-sm">Rp {Number(tx.amount).toLocaleString()}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-gray-400">{new Date(tx.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
