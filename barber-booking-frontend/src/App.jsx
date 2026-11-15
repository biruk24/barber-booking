import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import CustomerBookingView from './CustomerBookingView';
import BarberDashboard from './BarberDashboard';
import AdminDashboard from "./AdminDashbord";
import './index.css';

function PrivateRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-[#0A0B0E] text-[#F5F2EB] font-sans antialiased selection:bg-[#D4AF37]/30 selection:text-[#F5F2EB]">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* Public Dynamic Customer Booking Page */}
                    <Route path="/book/:shopSlug" element={<CustomerBookingView />} />
                    <Route path="/book" element={<CustomerBookingView />} />

                    {/* Protected Barber / Shop Owner Dashboard */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <PrivateRoute allowedRoles={['BARBER', 'SHOP_OWNER', 'ADMIN']}>
                                <BarberDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Protected Platform Admin Dashboard */}
                    <Route
                        path="/admin/*"
                        element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}