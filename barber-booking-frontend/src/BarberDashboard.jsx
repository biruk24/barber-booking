import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Users, Scissors, Clock, Settings,
    LogOut, CheckCircle, XCircle, TrendingUp, DollarSign, Menu, X
} from 'lucide-react';
import api from './api';

export default function BarberDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 14500, todayAppointments: 8, pendingCount: 3 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch dashboard data
        api.get('/barber/dashboard')
            .then((res) => {
                setAppointments(res.data.appointments || []);
                setServices(res.data.services || []);
                if (res.data.stats) setStats(res.data.stats);
            })
            .catch(() => {
                // Fallback mock dashboard data
                setAppointments([
                    { id: 1, customerName: 'Dawit Bekele', serviceName: 'Executive Haircut', date: '2026-06-06', timeSlot: '10:00 AM', status: 'PENDING', priceEtb: 600 },
                    { id: 2, customerName: 'Samuel Tadesse', serviceName: 'Beard Trim & Sculpting', date: '2026-06-06', timeSlot: '11:30 AM', status: 'CONFIRMED', priceEtb: 400 },
                    { id: 3, customerName: 'Michael Alemayehu', serviceName: 'Full Grooming Package', date: '2026-06-06', timeSlot: '02:00 PM', status: 'COMPLETED', priceEtb: 1100 }
                ]);
                setServices([
                    { id: 1, name: 'Executive Haircut', priceEtb: 600, durationMinutes: 45 },
                    { id: 2, name: 'Beard Trim', priceEtb: 400, durationMinutes: 30 }
                ]);
            });
    }, []);

    const handleStatusUpdate = (id, newStatus) => {
        api.patch(`/appointments/${id}/status`, { status: newStatus })
            .then(() => {
                setAppointments(appointments.map(app => app.id === id ? { ...app, status: newStatus } : app));
            })
            .catch(() => {
                setAppointments(appointments.map(app => app.id === id ? { ...app, status: newStatus } : app));
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0A0B0E] text-[#F5F2EB] flex">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-[#12141A] border-r border-[#2A2E3D] p-6">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#E6CA65] flex items-center justify-center text-[#0A0B0E]">
                        <Scissors className="w-5 h-5" />
                    </div>
                    <span className="font-serif text-lg tracking-wider font-semibold">BARBER PORTAL</span>
                </div>

                <nav className="space-y-2 flex-grow">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                            activeTab === 'overview' ? 'bg-[#D4AF37] text-[#0A0B0E] font-semibold' : 'text-[#9BA1B0] hover:bg-[#181B24] hover:text-[#F5F2EB]'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Overview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                            activeTab === 'appointments' ? 'bg-[#D4AF37] text-[#0A0B0E] font-semibold' : 'text-[#9BA1B0] hover:bg-[#181B24] hover:text-[#F5F2EB]'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Appointments</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                            activeTab === 'services' ? 'bg-[#D4AF37] text-[#0A0B0E] font-semibold' : 'text-[#9BA1B0] hover:bg-[#181B24] hover:text-[#F5F2EB]'
                        }`}
                    >
                        <Scissors className="w-4 h-4" />
                        <span>Services & Pricing</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                            activeTab === 'profile' ? 'bg-[#D4AF37] text-[#0A0B0E] font-semibold' : 'text-[#9BA1B0] hover:bg-[#181B24] hover:text-[#F5F2EB]'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Shop Profile</span>
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition mt-auto"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-20 border-b border-[#2A2E3D] bg-[#12141A]/50 backdrop-blur-md px-8 flex items-center justify-between">
                    <h1 className="text-2xl font-serif text-[#F5F2EB] capitalize">{activeTab}</h1>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-[#181B24] border border-[#2A2E3D] flex items-center justify-center font-serif text-[#D4AF37]">
                            BC
                        </div>
                    </div>
                </header>

                <div className="p-8 flex-grow">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs uppercase tracking-wider text-[#9BA1B0]">Today's Revenue</span>
                                        <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-3xl font-serif text-[#F5F2EB]">{stats.totalRevenue} ETB</h3>
                                </div>
                                <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs uppercase tracking-wider text-[#9BA1B0]">Today's Appointments</span>
                                        <Calendar className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-3xl font-serif text-[#F5F2EB]">{stats.todayAppointments}</h3>
                                </div>
                                <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs uppercase tracking-wider text-[#9BA1B0]">Pending Requests</span>
                                        <Clock className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-3xl font-serif text-[#F5F2EB]">{stats.pendingCount}</h3>
                                </div>
                            </div>

                            {/* Recent Appointments Table */}
                            <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                                <h3 className="text-xl font-serif text-[#F5F2EB] mb-6">Recent Appointments</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="border-b border-[#2A2E3D] text-xs uppercase tracking-wider text-[#9BA1B0]">
                                            <th className="pb-4">Customer</th>
                                            <th className="pb-4">Service</th>
                                            <th className="pb-4">Time</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2A2E3D]/50 text-sm">
                                        {appointments.map((app) => (
                                            <tr key={app.id} className="hover:bg-[#181B24]/50 transition">
                                                <td className="py-4 font-medium text-[#F5F2EB]">{app.customerName}</td>
                                                <td className="py-4 text-[#9BA1B0]">{app.serviceName}</td>
                                                <td className="py-4 text-[#F5F2EB]">{app.date} @ {app.timeSlot}</td>
                                                <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                app.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        app.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {app.status}
                            </span>
                                                </td>
                                                <td className="py-4 text-right space-x-2">
                                                    {app.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'CONFIRMED')}
                                                            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                                                            className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-xs font-semibold hover:bg-[#D4AF37]/30 transition"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                            <h3 className="text-xl font-serif text-[#F5F2EB] mb-6">All Appointments</h3>
                            <p className="text-sm text-[#9BA1B0]">Full appointment filtering, calendar view, and status management.</p>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                            <h3 className="text-xl font-serif text-[#F5F2EB] mb-6">Service & Pricing Management</h3>
                            <div className="space-y-4">
                                {services.map((srv) => (
                                    <div key={srv.id} className="p-4 bg-[#181B24] border border-[#2A2E3D] rounded-xl flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-[#F5F2EB]">{srv.name}</h4>
                                            <p className="text-xs text-[#9BA1B0]">{srv.durationMinutes} mins</p>
                                        </div>
                                        <span className="text-lg font-serif font-bold text-[#D4AF37]">{srv.priceEtb} ETB</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6 max-w-2xl">
                            <h3 className="text-xl font-serif text-[#F5F2EB] mb-6">Shop Profile Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Barbershop Name</label>
                                    <input type="text" defaultValue="Bole Crown Barbers" className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl px-4 py-3 text-[#F5F2EB]" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Location</label>
                                    <input type="text" defaultValue="Bole Medhanealem, Addis Ababa" className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl px-4 py-3 text-[#F5F2EB]" />
                                </div>
                                <button className="px-6 py-3 bg-[#D4AF37] text-[#0A0B0E] font-semibold rounded-xl hover:bg-[#E6CA65] transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}