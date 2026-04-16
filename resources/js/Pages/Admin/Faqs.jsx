import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Faqs({ auth, faqs }) {
    const { data, setData, post, processing, reset } = useForm({ question: '', answer: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.faqs.store'), {
            onSuccess: () => {
                reset();
                Swal.fire({ title: 'FAQ Added!', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-3xl font-black text-slate-900 tracking-tight">FAQ Knowledge Base</h2>}
        >
            <Head title="FAQ" />

            <div className="max-w-5xl mx-auto py-12 space-y-10">
                <section className="premium-card">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg"><Plus className="w-6 h-6 text-white" /></div>
                        <h3 className="text-xl font-black text-slate-800">Add Question</h3>
                    </div>
                    <form onSubmit={submit} className="space-y-6">
                        <input type="text" value={data.question} onChange={e => setData('question', e.target.value)} className="input-field" placeholder="Question Title..." required />
                        <textarea value={data.answer} onChange={e => setData('answer', e.target.value)} className="input-field h-32" placeholder="Provide an answer..." required></textarea>
                        <button type="submit" disabled={processing} className="btn-indigo w-full">Save FAQ</button>
                    </form>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqs.map(f => (
                        <div key={f.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl group relative">
                            <button onClick={() => router.delete(route('admin.faqs.destroy', f.id))} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-2"><HelpCircle className="w-4 h-4" /> Question</div>
                            <h4 className="font-black text-slate-800 mb-4">{f.question}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{f.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
