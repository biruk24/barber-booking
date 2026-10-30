import { useEffect, useState } from 'react'
import './Booking.css'
import { getAvailability } from './api'

function Booking({ shopId, service }) {
    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [adultCount, setAdultCount] = useState(1)
    const [childCount, setChildCount] = useState(0)

    const [selectedDate, setSelectedDate] = useState('')
    const [availableSlots, setAvailableSlots] = useState([])
    const [selectedTime, setSelectedTime] = useState('')

    const [loadingSlots, setLoadingSlots] = useState(false)
    const [availabilityError, setAvailabilityError] = useState('')

    // Get today's date in YYYY-MM-DD format
    const today = new Date()
    const minimumDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-')

    // Load available times when the date or customer counts change
    useEffect(() => {
        async function loadAvailableSlots() {
            if (!selectedDate || !service?.id) {
                setAvailableSlots([])
                setSelectedTime('')
                return
            }

            try {
                setLoadingSlots(true)
                setAvailabilityError('')
                setAvailableSlots([])
                setSelectedTime('')

                const data = await getAvailability(
                    shopId,
                    selectedDate,
                    [service.id],
                    adultCount,
                    childCount
                )

                setAvailableSlots(data.availableSlots || [])

            } catch (error) {
                console.error('Availability error:', error)
                setAvailabilityError(
                    'Unable to load available times. Please try again.'
                )
            } finally {
                setLoadingSlots(false)
            }
        }

        loadAvailableSlots()
    }, [shopId, selectedDate, service, adultCount, childCount])

    function handleSubmit(event) {
        event.preventDefault()

        if (!service?.id) {
            alert('Please select a service.')
            return
        }

        if (!selectedDate || !selectedTime) {
            alert('Please select an appointment date and time.')
            return
        }

        alert('Your booking details are ready. Next, we will connect appointment submission to the backend.')
    }

    return (
        <section className="booking-form-section" id="booking">
            <div className="booking-form-container">

                <p className="section-label">RESERVE YOUR VISIT</p>

                <h2>
                    BOOK YOUR <span>APPOINTMENT</span>
                </h2>

                <p className="booking-intro">
                    Choose your preferred date and available time.
                </p>

                <form onSubmit={handleSubmit} className="booking-form">

                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(event) => setCustomerName(event.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Selected Service</label>
                        <input
                            type="text"
                            value={service?.name || 'Classic Haircut'}
                            readOnly
                        />
                    </div>

                    <div className="form-row">

                        <div className="form-group">
                            <label>Adults</label>
                            <input
                                type="number"
                                min="1"
                                value={adultCount}
                                onChange={(event) =>
                                    setAdultCount(Number(event.target.value))
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Children</label>
                            <input
                                type="number"
                                min="0"
                                value={childCount}
                                onChange={(event) =>
                                    setChildCount(Number(event.target.value))
                                }
                            />
                        </div>

                    </div>

                    {/* APPOINTMENT DATE */}
                    <div className="form-group">
                        <label>Appointment Date</label>

                        <input
                            type="date"
                            min={minimumDate}
                            value={selectedDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                            required
                        />
                    </div>

                    {/* AVAILABLE TIME SLOTS */}
                    {selectedDate && (
                        <div className="time-selection">

                            <label>Choose Your Appointment Time</label>

                            {loadingSlots && (
                                <p className="availability-message">
                                    Checking available times...
                                </p>
                            )}

                            {!loadingSlots && availabilityError && (
                                <p className="availability-error">
                                    {availabilityError}
                                </p>
                            )}

                            {!loadingSlots &&
                                !availabilityError &&
                                availableSlots.length === 0 && (
                                    <p className="availability-message">
                                        No available appointments for this date.
                                    </p>
                                )}

                            {!loadingSlots && availableSlots.length > 0 && (
                                <div className="time-slots">

                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            className={
                                                selectedTime === slot
                                                    ? 'time-slot selected'
                                                    : 'time-slot'
                                            }
                                            onClick={() => setSelectedTime(slot)}
                                        >
                                            {slot}
                                        </button>
                                    ))}

                                </div>
                            )}

                        </div>
                    )}

                    <button
                        type="submit"
                        className="service-book-button"
                        disabled={loadingSlots || !selectedTime}
                    >
                        CONTINUE TO BOOKING →
                    </button>

                </form>
            </div>
        </section>
    )
}

export default Booking