import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <Head title="Log in" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-200 mb-6">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your automated store with ease.</p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-gray-700"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-gray-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-50"
                                />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            disabled={processing}
                            className="w-full bg-[#0F172A] text-white font-black py-5 rounded-2xl hover:bg-black hover:shadow-2xl hover:shadow-gray-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            Sign In to Console
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-8 text-sm font-bold text-gray-400">
                    Don't have an account? <Link href={route('register')} className="text-indigo-600 hover:underline">Register now</Link>
                </p>
            </motion.div>
        </div>
    );
}
