import { useEffect, useState } from 'react'
import './Booking.css'
import { getAvailability, createAppointment } from './api'

function Booking({ shopId, services }) {
    const haircut = services?.haircut
    const beardTrim = services?.beardTrim


const [customerName, setCustomerName] = useState('')
const [phone, setPhone] = useState('')

const [adultCount, setAdultCount] = useState(1)
const [childCount, setChildCount] = useState(0)

const [adultHaircut, setAdultHaircut] = useState(true)
const [adultBeardTrim, setAdultBeardTrim] = useState(false)
const [adultServicesOpen, setAdultServicesOpen] = useState(true)

const [selectedDate, setSelectedDate] = useState('')
const [availableSlots, setAvailableSlots] = useState([])
const [selectedTime, setSelectedTime] = useState('')

const [loadingSlots, setLoadingSlots] = useState(false)
const [availabilityError, setAvailabilityError] = useState('')

const [submitting, setSubmitting] = useState(false)
const [bookingSuccess, setBookingSuccess] = useState('')
const [bookingError, setBookingError] = useState('')

// Minimum appointment date
const today = new Date()

const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
].join('-')

// Adult service IDs
const adultServiceIds = []

if (adultHaircut && haircut?.id) {
    adultServiceIds.push(haircut.id)
}

if (adultBeardTrim && beardTrim?.id) {
    adultServiceIds.push(beardTrim.id)
}

// Children can only select Haircut
const childServiceIds =
    Number(childCount) > 0 && haircut?.id
        ? [haircut.id]
        : []

// Adult pricing
const adultPrice =
    adultHaircut && adultBeardTrim
        ? 700
        : adultHaircut
            ? 500
            : adultBeardTrim
                ? 300
                : 0

// Child pricing
const childPrice = 400

const totalPrice =
    adultPrice * Number(adultCount || 0) +
    childPrice * Number(childCount || 0)

// Load available appointment times
useEffect(() => {
    let cancelled = false

    async function loadAvailableSlots() {
        const adults = Number(adultCount || 0)
        const children = Number(childCount || 0)

        if (
            !selectedDate ||
            adultServiceIds.length === 0 && childServiceIds.length === 0 ||
            adults + children === 0 ||
            adults < 0 ||
            children < 0
        ) {
            setAvailableSlots([])
            setSelectedTime('')
            setAvailabilityError('')
            setLoadingSlots(false)
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
                adultServiceIds,
                childServiceIds,
                adults,
                children
            )

            if (!cancelled) {
                setAvailableSlots(data.availableSlots || [])
            }
        } catch (error) {
            console.error('Availability error:', error)

            if (!cancelled) {
                setAvailabilityError(
                    error.message ||
                    'Unable to load available times. Please try again.'
                )
            }
        } finally {
            if (!cancelled) {
                setLoadingSlots(false)
            }
        }
    }

    loadAvailableSlots()

    return () => {
        cancelled = true
    }
}, [
    shopId,
    selectedDate,
    adultCount,
    childCount,
    adultHaircut,
    adultBeardTrim,
    haircut?.id,
    beardTrim?.id
])

// Clear messages when form values change
function clearMessages() {
    setBookingError('')
    setBookingSuccess('')
}

// Submit appointment
async function handleSubmit(event) {
    event.preventDefault()

    setBookingError('')
    setBookingSuccess('')

    if (!haircut?.id) {
        setBookingError('Haircut service is currently unavailable.')
        return
    }

    if (!customerName.trim() || !phone.trim()) {
        setBookingError('Please enter your name and phone number.')
        return
    }

    const adults = Number(adultCount)
    const children = Number(childCount)

    if (
        adultCount === '' ||
        childCount === '' ||
        !Number.isInteger(adults) ||
        !Number.isInteger(children) ||
        adults < 0 ||
        children < 0
    ) {
        setBookingError('Please enter valid customer counts.')
        return
    }

    if (adults + children < 1) {
        setBookingError('Please enter at least one customer.')
        return
    }

    if (adults > 0 && adultServiceIds.length === 0) {
        setBookingError('Please select at least one adult service.')
        return
    }

    if (children > 0 && !haircut?.id) {
        setBookingError('Children can only receive Haircuts.')
        return
    }

    if (!selectedDate || !selectedTime) {
        setBookingError('Please select an appointment date and time.')
        return
    }

    const appointmentData = {
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        appointmentDate: selectedDate,
        startTime: selectedTime,
        adultCount: adults,
        childCount: children,
        adultServiceIds,
        childServiceIds
    }

    try {
        setSubmitting(true)

        const result = await createAppointment(
            shopId,
            appointmentData
        )

        setBookingSuccess(
            `Your appointment has been booked successfully! Appointment ID: ${result.id}`
        )

        // Clear the form after successful booking
        setCustomerName('')
        setPhone('')
        setAdultCount(1)
        setChildCount(0)
        setAdultHaircut(true)
        setAdultBeardTrim(false)
        setSelectedDate('')
        setSelectedTime('')
        setAvailableSlots([])

    } catch (error) {
        console.error('Booking error:', error)
        setBookingError(error.message)
    } finally {
        setSubmitting(false)
    }
}

return (
    <section className="booking-form-section" id="booking">
        <div className="booking-form-container">

            <p className="section-label">RESERVE YOUR VISIT</p>

            <h2>
                BOOK YOUR <span>APPOINTMENT</span>
            </h2>

            <p className="booking-intro">
                Choose your services, customer counts, date and time.
            </p>

            <form onSubmit={handleSubmit} className="booking-form">

                <div className="form-group">
                    <label>Your Name</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(event) => {
                            setCustomerName(event.target.value)
                            clearMessages()
                        }}
                        placeholder="Enter your full name"
                        maxLength={100}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(event) => {
                            setPhone(event.target.value)
                            clearMessages()
                        }}
                        placeholder="Enter your phone number"
                        required
                    />
                </div>

                <div className="service-dropdown">

                    <button
                        type="button"
                        className="service-dropdown-header"
                        onClick={() =>
                            setAdultServicesOpen(!adultServicesOpen)
                        }
                        aria-expanded={adultServicesOpen}
                    >
                        <div>
                            <h3>Choose Adult Services</h3>
                            <p>Select one or both services</p>
                        </div>

                        <span
                            className={
                                adultServicesOpen
                                    ? 'dropdown-arrow rotated'
                                    : 'dropdown-arrow'
                            }
                        >
                            ⌄
                        </span>
                    </button>

                    {adultServicesOpen && (
                        <div className="service-dropdown-list">

                            <label className="modern-service-option">
                                <input
                                    type="checkbox"
                                    checked={adultHaircut}
                                    onChange={(event) => {
                                        setAdultHaircut(
                                            event.target.checked
                                        )
                                        setSelectedTime('')
                                        clearMessages()
                                    }}
                                />

                                <span className="service-option-icon">
                                    ✂
                                </span>

                                <span className="modern-service-details">
                                    <strong>Haircut</strong>
                                    <small>Professional haircut</small>
                                </span>

                                <strong className="modern-service-price">
                                    500 ETB
                                </strong>
                            </label>

                            <label className="modern-service-option">
                                <input
                                    type="checkbox"
                                    checked={adultBeardTrim}
                                    onChange={(event) => {
                                        setAdultBeardTrim(
                                            event.target.checked
                                        )
                                        setSelectedTime('')
                                        clearMessages()
                                    }}
                                />

                                <span className="service-option-icon">
                                    ✦
                                </span>

                                <span className="modern-service-details">
                                    <strong>Beard Trim</strong>
                                    <small>
                                        Professional beard grooming
                                    </small>
                                </span>

                                <strong className="modern-service-price">
                                    300 ETB
                                </strong>
                            </label>

                            {adultHaircut && adultBeardTrim && (
                                <div className="combo-discount">
                                    <span>✦ SPECIAL COMBO OFFER</span>
                                    <strong>
                                        Haircut + Beard Trim = 700 ETB
                                    </strong>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                <div className="form-row">

                    <div className="form-group">
                        <label>Adults</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={adultCount}
                            onChange={(event) => {
                                setAdultCount(
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value)
                                )
                                setSelectedTime('')
                                clearMessages()
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Children</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={childCount}
                            onChange={(event) => {
                                setChildCount(
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value)
                                )
                                setSelectedTime('')
                                clearMessages()
                            }}
                        />
                    </div>

                </div>

                {Number(childCount) > 0 && (
                    <div className="children-service-card">

                        <span className="children-icon">✂</span>

                        <div>
                            <strong>Children's Haircut</strong>
                            <p>
                                Haircut only · 400 ETB per child
                            </p>
                            <small>
                                Beard Trim is not available for children.
                            </small>
                        </div>

                    </div>
                )}

                <div className="price-summary">

                    <div className="price-summary-heading">
                        <span>YOUR BOOKING</span>
                        <span>PRICE SUMMARY</span>
                    </div>

                    <div className="price-summary-row">
                        <span>Adult services</span>
                        <strong>
                            {adultPrice * Number(adultCount || 0)} ETB
                        </strong>
                    </div>

                    <div className="price-summary-row">
                        <span>Children's Haircuts</span>
                        <strong>
                            {childPrice * Number(childCount || 0)} ETB
                        </strong>
                    </div>

                    <div className="price-summary-total">
                        <span>Total Price</span>
                        <strong>
                            {totalPrice.toLocaleString()} ETB
                        </strong>
                    </div>

                </div>

                <div className="form-group">
                    <label>Appointment Date</label>

                    <input
                        type="date"
                        min={minimumDate}
                        value={selectedDate}
                        onChange={(event) => {
                            setSelectedDate(event.target.value)
                            setSelectedTime('')
                            clearMessages()
                        }}
                        required
                    />
                </div>

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
                                        onClick={() => {
                                            setSelectedTime(slot)
                                            clearMessages()
                                        }}
                                    >
                                        {slot}
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>
                )}

                {bookingSuccess && (
                    <div className="booking-success">
                        {bookingSuccess}
                    </div>
                )}

                {bookingError && (
                    <div className="booking-error">
                        {bookingError}
                    </div>
                )}

                <button
                    type="submit"
                    className="service-book-button"
                    disabled={
                        loadingSlots ||
                        submitting ||
                        !selectedTime
                    }
                >
                    {submitting
                        ? 'BOOKING...'
                        : 'CONFIRM APPOINTMENT →'}
                </button>

            </form>

        </div>
    </section>
)


}

export default Booking
