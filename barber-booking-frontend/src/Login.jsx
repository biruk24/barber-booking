import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import api from './api';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister
                ? { email, password, shopName, role: 'SHOP_OWNER' }
                : { email, password };

            const response = await api.post(endpoint, payload);
            const { token, role, shopSlug } = response.data;

            localStorage.setItem('jwt_token', token);
            localStorage.setItem('user_role', role);

            if (role === 'ADMIN') {
                navigate('/admin');
            } else if (role === 'SHOP_OWNER' || role === 'BARBER') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0B0E] px-4 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] mb-4 border border-[#D4AF37]/20">
                        <Scissors className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-serif text-[#F5F2EB] tracking-wide">
                        {isRegister ? 'Register Your Barbershop' : 'Barber Portal Login'}
                    </h1>
                    <p className="text-sm text-[#9BA1B0] mt-2">
                        {isRegister ? 'Join Addis Ababa’s premier grooming network' : 'Manage appointments, schedules, and your salon profile'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegister && (
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Barbershop Name</label>
                            <input
                                type="text"
                                required
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g. Bole Luxury Grooming"
                                className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl px-4 py-3 text-[#F5F2EB] placeholder-[#565E73] focus:outline-none focus:border-[#D4AF37] transition"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#565E73]" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="owner@barbershop.et"
                                className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl pl-12 pr-4 py-3 text-[#F5F2EB] placeholder-[#565E73] focus:outline-none focus:border-[#D4AF37] transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#565E73]" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl pl-12 pr-4 py-3 text-[#F5F2EB] placeholder-[#565E73] focus:outline-none focus:border-[#D4AF37] transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0A0B0E] font-semibold rounded-xl hover:opacity-95 transition flex items-center justify-center space-x-2 shadow-lg shadow-[#D4AF37]/10"
                    >
                        <span>{loading ? 'Processing...' : isRegister ? 'Create Shop Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm text-[#D4AF37] hover:underline focus:outline-none"
                    >
                        {isRegister ? 'Already have an account? Sign in' : 'New shop owner? Register your business'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}