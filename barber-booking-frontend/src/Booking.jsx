import { useEffect, useMemo, useState } from "react";
import {
    getAvailability,
    createAppointment,
} from "./api";
import "./Booking.css";

function Booking({ shopId, haircut, beardTrim }) {
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const [adultHaircut, setAdultHaircut] = useState(true);
    const [adultBeard, setAdultBeard] = useState(false);
    const [childHaircut, setChildHaircut] = useState(true);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const today = new Date();
    const minimumDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const adultServiceIds = useMemo(() => {
        const ids = [];

        if (adults > 0 && adultHaircut && haircut?.id) {
            ids.push(Number(haircut.id));
        }

        if (adults > 0 && adultBeard && beardTrim?.id) {
            ids.push(Number(beardTrim.id));
        }

        return ids;
    }, [adults, adultHaircut, adultBeard, haircut, beardTrim]);

    const childServiceIds = useMemo(() => {
        if (children > 0 && childHaircut && haircut?.id) {
            return [Number(haircut.id)];
        }

        return [];
    }, [children, childHaircut, haircut]);

    const adultPrice = adultHaircut && adultBeard
        ? 700
        : adultHaircut
            ? 500
            : adultBeard
                ? 300
                : 0;

    const childPrice = childHaircut ? 400 : 0;

    const totalPrice =
        adults * adultPrice + children * childPrice;

    useEffect(() => {
        setSelectedTime("");
        setAvailableSlots([]);

        if (!selectedDate) {
            return;
        }

        if (adults + children === 0) {
            return;
        }

        if (adults > 0 && adultServiceIds.length === 0) {
            return;
        }

        if (children > 0 && childServiceIds.length === 0) {
            return;
        }

        let cancelled = false;

        async function loadSlots() {
            setLoadingSlots(true);
            setError("");

            try {
                const response = await getAvailability(
                    shopId,
                    selectedDate,
                    adultServiceIds,
                    childServiceIds,
                    adults,
                    children
                );

                if (!cancelled) {
                    setAvailableSlots(response?.availableSlots || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setAvailableSlots([]);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoadingSlots(false);
                }
            }
        }

        loadSlots();

        return () => {
            cancelled = true;
        };
    }, [
        shopId,
        selectedDate,
        adults,
        children,
        adultServiceIds,
        childServiceIds,
    ]);

    async function handleBooking(event) {
        event.preventDefault();

        setError("");
        setSuccess(null);

        if (!customerName.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!customerPhone.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        if (!selectedDate) {
            setError("Please select an appointment date.");
            return;
        }

        if (adults + children === 0) {
            setError("Please select at least one customer.");
            return;
        }

        if (adults > 0 && adultServiceIds.length === 0) {
            setError("Please select an adult service.");
            return;
        }

        if (children > 0 && childServiceIds.length === 0) {
            setError("Please select a child haircut.");
            return;
        }

        if (!selectedTime) {
            setError("Please select an appointment time.");
            return;
        }

        const appointmentData = {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            appointmentDate: selectedDate,
            startTime: selectedTime,
            adultCount: adults,
            childCount: children,
            adultServiceIds,
            childServiceIds,
        };

        setBookingLoading(true);

        try {
            const response = await createAppointment(
                shopId,
                appointmentData
            );

            setSuccess(response);

            setCustomerName("");
            setCustomerPhone("");
            setSelectedTime("");
            setSelectedDate("");

            setAdults(1);
            setChildren(0);

            setAdultHaircut(true);
            setAdultBeard(false);
            setChildHaircut(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBookingLoading(false);
        }
    }

    return (
        <div className="booking-container">
            {success ? (
                <div className="booking-success">
                    <div className="success-icon">✓</div>

                    <p className="booking-eyebrow">BOOKING CONFIRMED</p>

                    <h2>Your appointment is reserved.</h2>

                    <p>
                        Thank you for choosing Kings Barber Shop.
                        Your booking has been successfully submitted.
                    </p>

                    <div className="success-details">
                        <div>
                            <span>Appointment ID</span>
                            <strong>#{success.id}</strong>
                        </div>

                        <div>
                            <span>Date</span>
                            <strong>{success.appointmentDate || selectedDate}</strong>
                        </div>

                        <div>
                            <span>Start time</span>
                            <strong>{success.startTime || selectedTime}</strong>
                        </div>

                        <div>
                            <span>Total</span>
                            <strong>
                                {success.totalPrice ?? totalPrice} ETB
                            </strong>
                        </div>
                    </div>

                    <button
                        className="booking-submit"
                        onClick={() => {
                            setSuccess(null);
                            setAvailableSlots([]);
                        }}
                    >
                        Make Another Booking
                    </button>
                </div>
            ) : (
                <form onSubmit={handleBooking}>
                    <div className="booking-layout">
                        <div className="booking-form-main">
                            <div className="booking-step">
                                <span className="step-number">01</span>
                                <div>
                                    <h3>Who is coming?</h3>
                                    <p>Select the number of adults and children.</p>
                                </div>
                            </div>

                            <div className="people-grid">
                                <div className="people-card">
                                    <div>
                                        <strong>Adults</strong>
                                        <small>13 years and above</small>
                                    </div>

                                    <div className="counter">
                                        <button
                                            type="button"
                                            onClick={() => setAdults(Math.max(0, adults - 1))}
                                            aria-label="Remove adult"
                                        >
                                            −
                                        </button>

                                        <strong>{adults}</strong>

                                        <button
                                            type="button"
                                            onClick={() => setAdults(Math.min(10, adults + 1))}
                                            aria-label="Add adult"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="people-card">
                                    <div>
                                        <strong>Children</strong>
                                        <small>12 years and below</small>
                                    </div>

                                    <div className="counter">
                                        <button
                                            type="button"
                                            onClick={() => setChildren(Math.max(0, children - 1))}
                                            aria-label="Remove child"
                                        >
                                            −
                                        </button>

                                        <strong>{children}</strong>

                                        <button
                                            type="button"
                                            onClick={() => setChildren(Math.min(10, children + 1))}
                                            aria-label="Add child"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="booking-step">
                                <span className="step-number">02</span>
                                <div>
                                    <h3>Choose your services</h3>
                                    <p>Choose services separately for adults and children.</p>
                                </div>
                            </div>

                            {adults > 0 && (
                                <div className="service-selection">
                                    <h4>ADULT SERVICES</h4>

                                    <label className="booking-option">
                                        <input
                                            type="checkbox"
                                            checked={adultHaircut}
                                            onChange={(event) =>
                                                setAdultHaircut(event.target.checked)
                                            }
                                        />

                                        <span>
                      <strong>Haircut</strong>
                      <small>Professional haircut</small>
                    </span>

                                        <b>500 ETB</b>
                                    </label>

                                    <label className="booking-option">
                                        <input
                                            type="checkbox"
                                            checked={adultBeard}
                                            onChange={(event) =>
                                                setAdultBeard(event.target.checked)
                                            }
                                        />

                                        <span>
                      <strong>Beard Trim</strong>
                      <small>Professional beard shaping</small>
                    </span>

                                        <b>300 ETB</b>
                                    </label>

                                    {adultHaircut && adultBeard && (
                                        <div className="combo-message">
                                            Special combo price: 700 ETB per adult.
                                        </div>
                                    )}
                                </div>
                            )}

                            {children > 0 && (
                                <div className="service-selection">
                                    <h4>CHILD SERVICES</h4>

                                    <label className="booking-option">
                                        <input
                                            type="checkbox"
                                            checked={childHaircut}
                                            onChange={(event) =>
                                                setChildHaircut(event.target.checked)
                                            }
                                        />

                                        <span>
                      <strong>Child Haircut</strong>
                      <small>Haircut for children</small>
                    </span>

                                        <b>400 ETB</b>
                                    </label>
                                </div>
                            )}

                            <div className="booking-step">
                                <span className="step-number">03</span>
                                <div>
                                    <h3>Select date and time</h3>
                                    <p>Choose an available appointment slot.</p>
                                </div>
                            </div>

                            <div className="date-field">
                                <label htmlFor="appointment-date">
                                    APPOINTMENT DATE
                                </label>

                                <input
                                    id="appointment-date"
                                    type="date"
                                    min={minimumDate}
                                    value={selectedDate}
                                    onChange={(event) => {
                                        setSelectedDate(event.target.value);
                                        setSelectedTime("");
                                    }}
                                />
                            </div>

                            {selectedDate && (
                                <div className="time-selection">
                                    <h4>AVAILABLE TIMES</h4>

                                    {loadingSlots ? (
                                        <p className="slots-message">
                                            Checking available times...
                                        </p>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="time-grid">
                                            {availableSlots.map((time) => (
                                                <button
                                                    type="button"
                                                    key={time}
                                                    className={
                                                        selectedTime === time
                                                            ? "time-slot selected"
                                                            : "time-slot"
                                                    }
                                                    onClick={() => setSelectedTime(time)}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="slots-message">
                                            No available times found. Try another date
                                            or change your selected services.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="booking-step">
                                <span className="step-number">04</span>
                                <div>
                                    <h3>Your contact information</h3>
                                    <p>Enter your details to complete the booking.</p>
                                </div>
                            </div>

                            <div className="customer-fields">
                                <div className="date-field">
                                    <label htmlFor="customer-name">FULL NAME</label>

                                    <input
                                        id="customer-name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={customerName}
                                        onChange={(event) =>
                                            setCustomerName(event.target.value)
                                        }
                                        maxLength={100}
                                    />
                                </div>

                                <div className="date-field">
                                    <label htmlFor="customer-phone">PHONE NUMBER</label>

                                    <input
                                        id="customer-phone"
                                        type="tel"
                                        placeholder="09XXXXXXXX"
                                        value={customerPhone}
                                        onChange={(event) =>
                                            setCustomerPhone(event.target.value)
                                        }
                                        maxLength={20}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="booking-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                className="booking-submit"
                                type="submit"
                                disabled={bookingLoading}
                            >
                                {bookingLoading
                                    ? "Submitting booking..."
                                    : "Confirm Appointment →"}
                            </button>
                        </div>

                        <aside className="booking-summary">
                            <p className="booking-eyebrow">YOUR APPOINTMENT</p>

                            <h3>Booking Summary</h3>

                            <div className="summary-line">
                                <span>Adults</span>
                                <strong>{adults}</strong>
                            </div>

                            <div className="summary-line">
                                <span>Children</span>
                                <strong>{children}</strong>
                            </div>

                            <div className="summary-divider"></div>

                            {adults > 0 && (
                                <>
                                    <p className="summary-label">ADULT SERVICES</p>

                                    <div className="summary-line">
                                        <span>Haircut</span>
                                        <strong>{adultHaircut ? "Yes" : "No"}</strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>Beard Trim</span>
                                        <strong>{adultBeard ? "Yes" : "No"}</strong>
                                    </div>
                                </>
                            )}

                            {children > 0 && (
                                <>
                                    <p className="summary-label">CHILD SERVICES</p>

                                    <div className="summary-line">
                                        <span>Haircut</span>
                                        <strong>{childHaircut ? "Yes" : "No"}</strong>
                                    </div>
                                </>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-line">
                                <span>Date</span>
                                <strong>{selectedDate || "Not selected"}</strong>
                            </div>

                            <div className="summary-line">
                                <span>Time</span>
                                <strong>{selectedTime || "Not selected"}</strong>
                            </div>

                            <div className="summary-total">
                                <span>ESTIMATED TOTAL</span>
                                <strong>{totalPrice.toLocaleString()} ETB</strong>
                            </div>

                            <p className="summary-note">
                                Final appointment pricing is calculated and
                                verified by the booking system.
                            </p>
                        </aside>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Booking;