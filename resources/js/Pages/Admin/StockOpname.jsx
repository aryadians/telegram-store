import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Database, ListTree, AlignLeft, CheckCircle2, Terminal, FileUp, Info } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StockOpname({ auth, products }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        assets_data: '',
        csv_file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.stock-opname.store'), {
            onSuccess: () => {
                reset('assets_data', 'csv_file');
                Swal.fire({
                    title: 'Database Injected!',
                    text: 'Stock has been successfully updated.',
                    icon: 'success',
                    customClass: { popup: 'rounded-[2rem]' }
                });
            },
        });
    };

    const detectCount = data.assets_data ? data.assets_data.split('\n').filter(l => l.trim()).length : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stock Injection</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-2"><Terminal className="w-4 h-4 text-indigo-600" /> Massive database stock refill</p>
                </div>
            }
        >
            <Head title="Stock Opname" />

            <div className="max-w-5xl mx-auto py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <section className="bg-white shadow-2xl shadow-slate-200/50 rounded-[3rem] border border-slate-100 overflow-hidden">
                            <div className="bg-[#0F172A] p-10 text-white flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                                        <Database className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Massive Stock Refill</h3>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">Automatic asset parsing</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="p-12 space-y-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">target_product_id</label>
                                    <select 
                                        className="input-field py-5 text-lg"
                                        value={data.product_id}
                                        onChange={e => setData('product_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- SELECT PRODUCT --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name.toUpperCase()} ({p.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Option 1: Import CSV File</label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileUp className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-500 font-bold">{data.csv_file ? data.csv_file.name : 'Click to upload CSV'}</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={e => setData('csv_file', e.target.files[0])} accept=".csv" />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end ml-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Option 2: Raw Text Input</label>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Detected: {detectCount} Units</span>
                                    </div>
                                    <textarea 
                                        className="input-field h-64 font-mono text-sm leading-relaxed p-8 shadow-inner border-slate-100 bg-slate-50/30"
                                        value={data.assets_data}
                                        onChange={e => setData('assets_data', e.target.value)}
                                        placeholder="email:password"
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={processing} className="btn-indigo w-full py-6 text-xl shadow-2xl shadow-indigo-200">
                                    <Database className="w-6 h-6" /> Start Stock Injection
                                </button>
                            </form>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100">
                            <div className="flex items-center gap-2 text-indigo-600 font-black mb-6 uppercase text-xs tracking-widest">
                                <Info className="w-5 h-5 shrink-0" /> CSV Header Format
                            </div>
                            <div className="space-y-6">
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                    Jika Anda menggunakan Excel, pastikan kolom pertama adalah data akun. Simpan sebagai <b>.CSV (Comma Delimited)</b>.
                                </p>
                                <div className="bg-slate-900 p-4 rounded-xl font-mono text-[10px] text-emerald-400">
                                    header_column_1 <br/>
                                    email1:pass1 <br/>
                                    email2:pass2 <br/>
                                    email3:pass3
                                </div>
                                <ul className="space-y-3 text-[11px] font-bold text-slate-400">
                                    <li className="flex gap-2"><span>&bull;</span> Kolom 1: Detail Akun (Wajib)</li>
                                    <li className="flex gap-2"><span>&bull;</span> Baris 1: Akan dianggap header (Diabaikan)</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
