import React, { useState, useEffect } from 'react';
import { Shield, Store, Users, Calendar, TrendingUp, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalShops: 24, totalBarbers: 58, totalAppointments: 1420 });
    const [shops, setShops] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/admin/stats')
            .then((res) => {
                if (res.data.stats) setStats(res.data.stats);
                setShops(res.data.shops || []);
            })
            .catch(() => {
                setShops([
                    { id: 1, name: 'Bole Crown Barbers', owner: 'Ermias Kebede', status: 'ACTIVE', appointmentsCount: 320 },
                    { id: 2, name: 'Kazanchis Elite', owner: 'Natnael Mekonnen', status: 'ACTIVE', appointmentsCount: 285 },
                    { id: 3, name: 'Piasa Classic Cuts', owner: 'Solomon Tadesse', status: 'PENDING', appointmentsCount: 140 }
                ]);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0A0B0E] text-[#F5F2EB] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#12141A] border-r border-[#2A2E3D] p-6 flex flex-col">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#E6CA65] flex items-center justify-center text-[#0A0B0E]">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-serif text-lg tracking-wider font-semibold">ADMIN PANEL</span>
                </div>

                <nav className="space-y-2 flex-grow">
                    <div className="px-4 py-3 rounded-xl bg-[#D4AF37] text-[#0A0B0E] font-semibold text-sm flex items-center space-x-3">
                        <Store className="w-4 h-4" />
                        <span>Platform Shops</span>
                    </div>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Content */}
            <main className="flex-grow p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif text-[#F5F2EB]">Platform Administration</h1>
                        <p className="text-sm text-[#9BA1B0] mt-1">Monitor registered shops, appointments, and global statistics</p>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                        <span className="text-xs uppercase tracking-wider text-[#9BA1B0]">Total Registered Shops</span>
                        <h3 className="text-3xl font-serif text-[#F5F2EB] mt-2">{stats.totalShops}</h3>
                    </div>
                    <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                        <span className="text-xs uppercase tracking-wider text-[#9BA1B0]">Total Barbers</span>
                        <h3 className="text-3xl font-serif text-[#F5F2EB] mt-2">{stats.totalBarbers}</h3>
                    </div>
                    <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                        <span className="text-xs uppercase tracking-wider text-[#9BA1B0]">Total Appointments</span>
                        <h3 className="text-3xl font-serif text-[#F5F2EB] mt-2">{stats.totalAppointments}</h3>
                    </div>
                </div>

                {/* Shops Management Table */}
                <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                    <h3 className="text-xl font-serif text-[#F5F2EB] mb-6">Registered Barbershops</h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-[#2A2E3D] text-xs uppercase tracking-wider text-[#9BA1B0]">
                            <th className="pb-4">Shop Name</th>
                            <th className="pb-4">Owner</th>
                            <th className="pb-4">Appointments</th>
                            <th className="pb-4">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2E3D]/50 text-sm">
                        {shops.map((shop) => (
                            <tr key={shop.id} className="hover:bg-[#181B24]/50 transition">
                                <td className="py-4 font-medium text-[#F5F2EB]">{shop.name}</td>
                                <td className="py-4 text-[#9BA1B0]">{shop.owner}</td>
                                <td className="py-4 text-[#F5F2EB]">{shop.appointmentsCount}</td>
                                <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        shop.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {shop.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}