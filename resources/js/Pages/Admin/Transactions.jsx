import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Download, Trash2, CheckSquare, Square, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Transactions({ auth, transactions, filters }) {
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

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.data.map(t => t.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const exportData = (type) => {
        const ids = selectedIds.join(',');
        window.location.href = route('admin.transactions.export', { type, ids });
    };

    const handleBulkDelete = () => {
        Swal.fire({
            title: `Delete ${selectedIds.length} records?`,
            text: "This process is irreversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Confirm Delete',
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ledger Audits</h2>
                        <p className="text-slate-400 text-[10px] sm:text-sm font-bold uppercase tracking-widest">Monitor revenue & settlements</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-12 pr-6 py-3 sm:py-4 bg-white border border-slate-200 rounded-[1rem] sm:rounded-2xl text-xs sm:text-sm font-bold focus:ring-4 focus:ring-indigo-50 transition-all w-full shadow-sm"
                                placeholder="Ref or User ID..."
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => exportData('pdf')} className="flex-1 sm:flex-none p-3 sm:p-4 bg-white border border-slate-200 rounded-[1rem] sm:rounded-2xl hover:bg-slate-50 transition shadow-sm text-slate-600 flex items-center justify-center gap-2 font-bold text-xs"><FileText className="w-4 h-4" /> <span className="sm:hidden">PDF</span></button>
                            <button onClick={() => exportData('csv')} className="flex-1 sm:flex-none p-3 sm:p-4 bg-white border border-slate-200 rounded-[1rem] sm:rounded-2xl hover:bg-slate-50 transition shadow-sm text-slate-600 flex items-center justify-center gap-2 font-bold text-xs"><FileSpreadsheet className="w-4 h-4" /> <span className="sm:hidden">CSV</span></button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Transactions" />

            <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
                {selectedIds.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 bg-indigo-600 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-indigo-200 text-white gap-4">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-sm sm:text-lg font-black">{selectedIds.length} Selected</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button onClick={() => exportData('pdf')} className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10">PDF</button>
                            <button onClick={() => exportData('csv')} className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10">CSV</button>
                            <button onClick={handleBulkDelete} className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">Delete</button>
                        </div>
                    </div>
                )}

                <section className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[8px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                                    <th className="py-6 sm:py-8 px-6 sm:px-10 w-12 sm:w-16">
                                        <button onClick={toggleSelectAll} className="text-slate-300 hover:text-indigo-600 transition-all">
                                            {selectedIds.length === transactions.data.length && transactions.data.length > 0 ? <CheckSquare className="w-5 h-5 sm:w-6 text-indigo-600" /> : <Square className="w-5 h-5 sm:w-6" />}
                                        </button>
                                    </th>
                                    <th className="py-6 sm:py-8 px-4">Log Hub</th>
                                    <th className="py-6 sm:py-8 px-4 hidden sm:table-cell">Product</th>
                                    <th className="py-6 sm:py-8 px-4 text-center sm:text-left">Revenue</th>
                                    <th className="py-6 sm:py-8 px-4 text-center">Status</th>
                                    <th className="py-6 sm:py-8 px-6 sm:px-10 text-right hidden lg:table-cell">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id} className={`hover:bg-indigo-50/20 transition-all group ${selectedIds.includes(tx.id) ? 'bg-indigo-50/40' : ''}`}>
                                        <td className="py-6 px-6 sm:px-10">
                                            <button onClick={() => toggleSelect(tx.id)} className="text-slate-200 group-hover:text-indigo-400 transition-all">
                                                {selectedIds.includes(tx.id) ? <CheckSquare className="w-5 h-5 sm:w-6 text-indigo-600" /> : <Square className="w-5 h-5 sm:w-6" />}
                                            </button>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="font-mono text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-tighter truncate max-w-[80px] sm:max-w-none">{tx.reference}</div>
                                            <div className="text-[8px] sm:text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter sm:hidden">{tx.product.name}</div>
                                        </td>
                                        <td className="py-6 px-4 hidden sm:table-cell">
                                            <div className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{tx.product.name}</div>
                                        </td>
                                        <td className="py-6 px-4 text-center sm:text-left">
                                            <div className="text-sm sm:text-lg font-black text-slate-900 leading-none tracking-tighter">Rp{Number(tx.amount).toLocaleString()}</div>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <span className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[7px] sm:text-[10px] font-black uppercase tracking-widest border ${
                                                tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="py-6 px-10 text-right hidden lg:table-cell">
                                            <div className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(tx.created_at).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-slate-300 font-bold mt-1 uppercase">{new Date(tx.created_at).toLocaleTimeString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 sm:p-12 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Record {transactions.from}-{transactions.to} of {transactions.total}</div>
                        <div className="flex gap-1.5 sm:gap-2">
                            {transactions.links.map((link, i) => (
                                <button 
                                    key={i}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => window.location.href = link.url}
                                    className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase rounded-[0.8rem] sm:rounded-2xl transition-all ${
                                        link.active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
