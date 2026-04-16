import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, FileText, FileSpreadsheet, Trash2, Square, CheckSquare } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Transactions({ auth, transactions = { data: [], links: [] }, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('admin.transactions'), { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const toggleSelect = (id) => {
        selectedIds.includes(id) ? setSelectedIds(selectedIds.filter(i => i !== id)) : setSelectedIds([...selectedIds, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.data.map(t => t.id));
        }
    };

    const exportData = (type) => {
        window.location.href = route('admin.transactions.export', { type, ids: selectedIds.join(',') });
    };

    const handleBulkDelete = () => {
        Swal.fire({
            title: `Delete ${selectedIds.length} records?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete',
            customClass: { popup: 'rounded-[2rem]' }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.transactions.bulk-delete'), { ids: selectedIds }, {
                    onSuccess: () => {
                        setSelectedIds([]);
                        Swal.fire({ title: 'Deleted!', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Ledger Audits</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Financial Logs</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full" 
                                placeholder="Search Ref..." 
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => exportData('pdf')} className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition shadow-sm"><FileText className="w-4 h-4 mx-auto" /></button>
                            <button onClick={() => exportData('csv')} className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition shadow-sm"><FileSpreadsheet className="w-4 h-4 mx-auto" /></button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Transactions" />

            <div className="space-y-6">
                {selectedIds.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl text-white animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">{selectedIds.length} items selected</span>
                        <div className="flex gap-2">
                            <button onClick={handleBulkDelete} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition">Delete</button>
                            <button onClick={() => exportData('pdf')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition">Export Selected</button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <th className="py-4 px-6 w-12">
                                        <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition">
                                            {selectedIds.length === (transactions.data?.length || 0) && transactions.data?.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </th>
                                    <th className="py-4 px-4">Log Reference</th>
                                    <th className="py-4 px-4">Product</th>
                                    <th className="py-4 px-4">Revenue</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(transactions.data || []).map(tx => (
                                    <tr key={tx.id} className={`hover:bg-slate-50/50 transition ${selectedIds.includes(tx.id) ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="py-4 px-6">
                                            <button onClick={() => toggleSelect(tx.id)} className="text-slate-300">
                                                {selectedIds.includes(tx.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">{tx.reference}</div>
                                            <div className="text-[9px] text-slate-400">UID: {tx.chat_id}</div>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-bold text-slate-700 uppercase">{tx.product?.name || 'Unknown'}</td>
                                        <td className="py-4 px-4 text-sm font-bold text-slate-900 tracking-tight">Rp{Number(tx.amount || 0).toLocaleString()}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider ${tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{tx.status}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right text-[10px] font-bold text-slate-400 uppercase">{new Date(tx.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {transactions.data?.length === 0 && (
                                    <tr><td colSpan="6" className="py-20 text-center text-slate-300 text-xs italic uppercase tracking-widest font-black">No transaction logs found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {transactions.current_page || 1}</span>
                        <div className="flex gap-1.5">
                            {(transactions.links || []).map((link, i) => (
                                <button key={i} disabled={!link.url} dangerouslySetInnerHTML={{ __html: link.label }} onClick={() => window.location.href = link.url} className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg border transition-all ${link.active ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'} ${!link.url ? 'opacity-30' : ''}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
