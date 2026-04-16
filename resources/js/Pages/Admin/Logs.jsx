import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Terminal, Shield, Clock, User, Info } from 'lucide-react';

export default function Logs({ auth, system_logs, audit_logs }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Intelligence</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Live Logs & Audit Trails</p>
                </div>
            }
        >
            <Head title="System Logs" />

            <div className="space-y-8">
                {/* SYSTEM LOGS (LARAVEL.LOG) */}
                <section className="premium-card !p-0 overflow-hidden bg-slate-900 border-slate-800">
                    <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <Terminal className="w-4 h-4 text-emerald-400" /> system_runtime.log
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                        </div>
                    </div>
                    <div className="p-6 h-80 overflow-y-auto custom-scrollbar font-mono text-[10px] text-slate-400 leading-relaxed">
                        <pre>{system_logs}</pre>
                    </div>
                </section>

                {/* AUDIT LOGS (ADMIN ACTIONS) */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Administrative Audit Trail</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-8 w-48 text-center">Timestamp</th>
                                    <th className="py-4 px-8">Administrator</th>
                                    <th className="py-4 px-8">Event Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {audit_logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                                        <td className="py-4 px-8 text-center text-[10px] font-bold text-slate-400 font-mono italic">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold uppercase">{log.user_name ? log.user_name[0] : 'S'}</div>
                                                <span className="text-xs font-bold text-slate-700 uppercase">{log.user_name || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-8">
                                            <span className="text-xs font-medium text-slate-600 leading-relaxed">{log.action}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
