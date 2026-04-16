import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Faqs({ auth, faqs = [] }) {
    const { data, setData, post, processing, reset } = useForm({ question: '', answer: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.faqs.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({ title: 'FAQ Logged', icon: 'success', customClass: { popup: 'rounded-2xl' } });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Support Logic</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">FAQ Management</p>
                </div>
            }
        >
            <Head title="FAQ" />

            <div className="max-w-5xl mx-auto space-y-8">
                <section className="premium-card">
                    <form onSubmit={submit} className="space-y-4">
                        <input type="text" value={data.question} onChange={e => setData('question', e.target.value)} className="input-field !py-2.5 text-xs font-bold" placeholder="Question Title..." required />
                        <textarea value={data.answer} onChange={e => setData('answer', e.target.value)} className="input-field h-24 !py-3 text-xs" placeholder="Detailed Answer..." required></textarea>
                        <button type="submit" disabled={processing} className="btn-indigo !py-2.5 w-full">Save Knowledge</button>
                    </form>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {faqs.map(f => (
                        <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group relative">
                            <button onClick={() => router.delete(route('admin.faqs.destroy', f.id))} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[9px] uppercase tracking-widest mb-2"><HelpCircle className="w-3.5 h-3.5" /> Q&A Pair</div>
                            <h4 className="font-bold text-slate-800 text-sm mb-2">{f.question}</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">{f.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
