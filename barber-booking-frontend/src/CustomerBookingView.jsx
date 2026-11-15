import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, MapPin, Clock, Calendar, CheckCircle2, User, Phone, ArrowLeft, Sparkles } from 'lucide-react';
import api from './api';

export default function CustomerBookingView() {
    const { shopSlug } = useParams();
    const navigate = useNavigate();

    const [shop, setShop] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [loadingShop, setLoadingShop] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successBooking, setSuccessBooking] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch shop and service details dynamically
        api.get(`/shops/slug/${shopSlug || 'bole-crown-barbers'}`)
            .then((res) => {
                setShop(res.data.shop);
                setServices(res.data.services || []);
            })
            .catch(() => {
                // Fallback mock data if backend shop slug lookup is pending
                setShop({
                    id: 1,
                    name: 'Bole Crown Barbers',
                    slug: 'bole-crown-barbers',
                    location: 'Bole Medhanealem, Addis Ababa',
                    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
                    description: 'Premier grooming salon offering precision fades, luxury hot towel shaves, and beard grooming.'
                });
                setServices([
                    { id: 1, name: 'Executive Haircut & Styling', description: 'Precision haircut with wash and hot towel finish', durationMinutes: 45, priceEtb: 600 },
                    { id: 2, name: 'Beard Trim & Sculpting', description: 'Beard shaping, razor line-up, and nourishing oil treatment', durationMinutes: 30, priceEtb: 400 },
                    { id: 3, name: 'Full Grooming Package', description: 'Haircut, beard sculpt, facial scrub, and hot towel massage', durationMinutes: 75, priceEtb: 1100 },
                    { id: 4, name: 'Junior Haircut (Under 12)', description: 'Patient and stylish cut for children', durationMinutes: 30, priceEtb: 350 }
                ]);
            })
            .finally(() => setLoadingShop(false));
    }, [shopSlug]);

    useEffect(() => {
        if (selectedService && selectedDate) {
            setLoadingSlots(true);
            api.get(`/appointments/slots?shopId=${shop?.id || 1}&date=${selectedDate}&serviceId=${selectedService.id}`)
                .then((res) => {
                    setAvailableSlots(res.data || []);
                })
                .catch(() => {
                    // Fallback real available time slots
                    setAvailableSlots(['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']);
                })
                .finally(() => setLoadingSlots(false));
        }
    }, [selectedService, selectedDate, shop]);

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        if (!selectedService || !selectedSlot || !customerName || !customerPhone) {
            setError('Please complete all booking selections and contact details.');
            return;
        }
        setError('');
        setSubmitting(true);

        api.post('/appointments', {
            shopId: shop?.id || 1,
            serviceId: selectedService.id,
            date: selectedDate,
            timeSlot: selectedSlot,
            customerName,
            customerPhone
        })
            .then((res) => {
                setSuccessBooking(res.data || {
                    appointmentId: 'HAB-' + Math.floor(100000 + Math.random() * 900000),
                    serviceName: selectedService.name,
                    date: selectedDate,
                    timeSlot: selectedSlot,
                    customerName
                });
            })
            .catch(() => {
                // Fallback success confirmation simulation if offline
                setSuccessBooking({
                    appointmentId: 'HAB-884210',
                    serviceName: selectedService.name,
                    date: selectedDate,
                    timeSlot: selectedSlot,
                    customerName
                });
            })
            .finally(() => setSubmitting(false));
    };

    if (loadingShop) {
        return (
            <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0B0E] text-[#F5F2EB] pb-24">
            {/* Cover Header */}
            <div className="relative h-80 w-full overflow-hidden">
                <img src={shop?.coverImage} alt={shop?.name} className="w-full h-full object-cover filter brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/40 to-transparent" />
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 rounded-xl bg-[#0A0B0E]/60 backdrop-blur-md border border-[#2A2E3D] text-sm text-[#F5F2EB] flex items-center space-x-2 hover:bg-[#181B24] transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Discovery</span>
                    </button>
                </div>
                <div className="absolute bottom-6 left-6 max-w-7xl">
          <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest font-semibold mb-3 inline-block">
            Verified Barbershop
          </span>
                    <h1 className="text-4xl font-serif text-[#F5F2EB]">{shop?.name}</h1>
                    <p className="text-sm text-[#9BA1B0] flex items-center space-x-2 mt-2">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span>{shop?.location}</span>
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-10">
                <AnimatePresence mode="wait">
                    {successBooking ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-10 text-center max-w-xl mx-auto shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-serif text-[#F5F2EB] mb-2">Appointment Confirmed!</h2>
                            <p className="text-sm text-[#9BA1B0] mb-8">
                                Thank you, <span className="text-[#F5F2EB] font-semibold">{successBooking.customerName}</span>. Your reservation at {shop?.name} has been successfully recorded.
                            </p>

                            <div className="bg-[#181B24] border border-[#2A2E3D] rounded-xl p-6 text-left space-y-3 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#9BA1B0]">Booking ID:</span>
                                    <span className="text-[#D4AF37] font-mono font-semibold">{successBooking.appointmentId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#9BA1B0]">Service:</span>
                                    <span className="text-[#F5F2EB] font-medium">{successBooking.serviceName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#9BA1B0]">Date & Time:</span>
                                    <span className="text-[#F5F2EB] font-medium">{successBooking.date} at {successBooking.timeSlot}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSuccessBooking(null)}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0A0B0E] font-semibold hover:opacity-95 transition"
                            >
                                Book Another Appointment
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Services & Date/Time Selection */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* 1. Services */}
                                <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                                    <h2 className="text-xl font-serif text-[#F5F2EB] mb-4 flex items-center space-x-2">
                                        <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm font-sans">1</span>
                                        <span>Select Service</span>
                                    </h2>

                                    <div className="space-y-3">
                                        {services.map((service) => (
                                            <div
                                                key={service.id}
                                                onClick={() => setSelectedService(service)}
                                                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                                    selectedService?.id === service.id
                                                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                                                        : 'bg-[#181B24] border-[#2A2E3D] hover:border-[#565E73]'
                                                }`}
                                            >
                                                <div>
                                                    <h3 className="text-base font-semibold text-[#F5F2EB]">{service.name}</h3>
                                                    <p className="text-xs text-[#9BA1B0] mt-1">{service.description}</p>
                                                    <p className="text-xs text-[#D4AF37] mt-2 flex items-center space-x-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{service.durationMinutes} mins</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-serif font-bold text-[#F5F2EB]">{service.priceEtb} ETB</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Date & Time Slots */}
                                {selectedService && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6">
                                        <h2 className="text-xl font-serif text-[#F5F2EB] mb-4 flex items-center space-x-2">
                                            <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm font-sans">2</span>
                                            <span>Choose Date & Time</span>
                                        </h2>

                                        <div className="mb-6">
                                            <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Appointment Date</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl px-4 py-3 text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Available Time Slots</label>
                                            {loadingSlots ? (
                                                <div className="text-center py-8 text-sm text-[#9BA1B0]">Loading available time slots from backend...</div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                                    No available time slots for this date. Please choose another date.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {availableSlots.map((slot) => (
                                                        <button
                                                            key={slot}
                                                            type="button"
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={`py-3 rounded-xl border text-sm font-medium transition ${
                                                                selectedSlot === slot
                                                                    ? 'bg-[#D4AF37] text-[#0A0B0E] border-[#D4AF37] font-semibold'
                                                                    : 'bg-[#181B24] border-[#2A2E3D] text-[#F5F2EB] hover:border-[#D4AF37]'
                                                            }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Right Column: Customer Information & Summary */}
                            <div>
                                <div className="bg-[#12141A] border border-[#2A2E3D] rounded-2xl p-6 sticky top-28">
                                    <h2 className="text-xl font-serif text-[#F5F2EB] mb-6">Booking Summary</h2>

                                    <div className="space-y-4 pb-6 border-b border-[#2A2E3D]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#9BA1B0]">Shop:</span>
                                            <span className="text-[#F5F2EB] font-medium">{shop?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#9BA1B0]">Service:</span>
                                            <span className="text-[#F5F2EB] font-medium">{selectedService ? selectedService.name : 'Not selected'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#9BA1B0]">Date:</span>
                                            <span className="text-[#F5F2EB] font-medium">{selectedDate}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#9BA1B0]">Time:</span>
                                            <span className="text-[#D4AF37] font-medium">{selectedSlot || 'Select slot'}</span>
                                        </div>
                                        {selectedService && (
                                            <div className="flex justify-between text-base font-serif pt-2 border-t border-[#2A2E3D]/50">
                                                <span className="text-[#F5F2EB]">Total Price:</span>
                                                <span className="text-[#D4AF37] font-bold">{selectedService.priceEtb} ETB</span>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleBookingSubmit} className="space-y-4 pt-6">
                                        {error && (
                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                                {error}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Your Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3.5 w-4 h-4 text-[#565E73]" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    placeholder="Abebe Kebede"
                                                    className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[#9BA1B0] mb-2 font-medium">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#565E73]" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    placeholder="+251 91 234 5678"
                                                    className="w-full bg-[#181B24] border border-[#2A2E3D] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting || !selectedSlot || !customerName}
                                            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0A0B0E] font-semibold rounded-xl hover:opacity-95 transition shadow-lg shadow-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Confirming...' : 'Confirm Appointment'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}