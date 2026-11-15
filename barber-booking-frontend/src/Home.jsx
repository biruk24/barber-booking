import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, Calendar, Shield, Sparkles, MapPin, ChevronRight, Star, Clock } from 'lucide-react';
import api from './api';

export default function Home() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/shops/featured')
            .then((res) => {
                setShops(res.data || []);
            })
            .catch(() => {
                // Fallback mock shops for Addis Ababa if API is pending connection
                setShops([
                    { id: 1, name: 'Bole Crown Barbers', slug: 'bole-crown-barbers', rating: 4.9, location: 'Bole Medhanealem, Addis Ababa', coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80' },
                    { id: 2, name: 'Kazanchis Elite Grooming', slug: 'kazanchis-elite', rating: 4.8, location: 'Kazanchis, Addis Ababa', coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80' },
                    { id: 3, name: 'Piasa Classic Cuts', slug: 'piasa-classic-cuts', rating: 4.9, location: 'Piasa, Addis Ababa', coverImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80' }
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0B0E] text-[#F5F2EB] font-sans">
            {/* Navigation Bar */}
            <header className="border-b border-[#2A2E3D]/50 bg-[#0A0B0E]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#E6CA65] flex items-center justify-center text-[#0A0B0E]">
                            <Scissors className="w-5 h-5" />
                        </div>
                        <span className="font-serif text-xl tracking-wider text-[#F5F2EB] font-semibold">HABESHA CUTS</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/login" className="text-sm font-medium text-[#9BA1B0] hover:text-[#F5F2EB] transition">
                            Partner Login
                        </Link>
                        <Link to="/login" className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A0B0E] text-sm font-semibold hover:bg-[#E6CA65] transition shadow-lg shadow-[#D4AF37]/10">
                            Register Shop
                        </Link>
                    </div>
                </div>
            </header>

            {/* Cinematic Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
            <span className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#181B24] border border-[#2A2E3D] text-[#D4AF37] text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Addis Ababa’s Luxury Grooming Platform</span>
            </span>
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tight max-w-4xl mx-auto leading-tight text-[#F5F2EB] mb-8">
                            Where Precision Craftsmanship Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E6CA65]">Modern Elegance</span>
                        </h1>
                        <p className="text-lg text-[#9BA1B0] max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                            Discover top-tier independent barbershops across Addis Ababa. Book your appointment seamlessly in seconds without creating an account.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Featured Barbershops Section */}
            <section className="py-20 border-t border-[#2A2E3D]/50 bg-[#0E1017]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-serif text-[#F5F2EB]">Featured Barbershops</h2>
                            <p className="text-sm text-[#9BA1B0] mt-1">Handpicked elite grooming studios in Addis Ababa</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {shops.map((shop, index) => (
                            <motion.div
                                key={shop.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group bg-[#12141A] border border-[#2A2E3D] rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition duration-300 flex flex-col"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={shop.coverImage}
                                        alt={shop.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-[#0A0B0E]/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 border border-[#2A2E3D]">
                                        <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                                        <span className="text-xs font-semibold text-[#F5F2EB]">{shop.rating || '4.9'}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow justify-between">
                                    <div>
                                        <h3 className="text-xl font-serif text-[#F5F2EB] mb-2">{shop.name}</h3>
                                        <p className="text-xs text-[#9BA1B0] flex items-center space-x-1.5 mb-4">
                                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            <span>{shop.location}</span>
                                        </p>
                                    </div>
                                    <Link
                                        to={`/book/${shop.slug}`}
                                        className="w-full py-3 rounded-xl bg-[#181B24] border border-[#2A2E3D] hover:border-[#D4AF37] text-center text-sm font-medium text-[#F5F2EB] group-hover:bg-[#D4AF37] group-hover:text-[#0A0B0E] transition flex items-center justify-center space-x-2"
                                    >
                                        <span>Book Appointment</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#2A2E3D]/50 bg-[#0A0B0E] py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-[#9BA1B0]">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <Scissors className="w-5 h-5 text-[#D4AF37]" />
                        <span className="font-serif text-[#F5F2EB] tracking-wider">HABESHA CUTS PLATFORM</span>
                    </div>
                    <p>© {new Date().getFullYear()} Habesha Cuts. All rights reserved. Addis Ababa, Ethiopia.</p>
                </div>
            </footer>
        </div>
    );
}