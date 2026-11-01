import { useEffect, useRef, useState } from "react";
import {
    getAppointments,
    getShopServices,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
} from "./api";

import "./BarberDashboard.css";

const SHOP_ID = 1;
const POLLING_INTERVAL = 15000;

function BarberDashboard({ barberUser, onLogout }) {
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [notification, setNotification] = useState(null);


const knownAppointmentIds = useRef(null);
const notificationTimer = useRef(null);

const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
});

const [selectedDate, setSelectedDate] = useState(null);

// Load appointments for the first time.
async function loadAppointments() {
    try {
        setError("");

        const data = await getAppointments(SHOP_ID);
        const appointmentList = Array.isArray(data) ? data : [];

        setAppointments(appointmentList);

        // Remember existing appointments without notifying the barber.
        if (knownAppointmentIds.current === null) {
            knownAppointmentIds.current = new Set(
                appointmentList.map((appointment) => appointment.id)
            );
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

// Load shop services.
async function loadServices() {
    try {
        const data = await getShopServices(SHOP_ID);
        setServices(Array.isArray(data) ? data : []);
    } catch (err) {
        setError(err.message);
    }
}

// Check automatically for new appointments.
async function checkForNewAppointments() {
    try {
        const data = await getAppointments(SHOP_ID);

        if (!Array.isArray(data)) return;

        const currentIds = new Set(
            data.map((appointment) => appointment.id)
        );

        // If initial loading has not finished, establish a baseline.
        if (knownAppointmentIds.current === null) {
            knownAppointmentIds.current = currentIds;
            setAppointments(data);
            return;
        }

        const newAppointments = data.filter(
            (appointment) =>
                !knownAppointmentIds.current.has(appointment.id)
        );

        knownAppointmentIds.current = currentIds;

        // Update dashboard appointment list.
        setAppointments(data);

        // Show notification for the newest booking.
        if (newAppointments.length > 0) {
            const newestAppointment = newAppointments[0];

            setNotification(newestAppointment);

            clearTimeout(notificationTimer.current);

            notificationTimer.current = setTimeout(() => {
                setNotification(null);
            }, 10000);
        }
    } catch (err) {
        console.error(
            "Automatic appointment check failed:",
            err
        );
    }
}

// Load data and start automatic checking.
useEffect(() => {
    loadAppointments();
    loadServices();

    const interval = setInterval(() => {
        checkForNewAppointments();
    }, POLLING_INTERVAL);

    return () => {
        clearInterval(interval);
        clearTimeout(notificationTimer.current);
    };
}, []);

// Confirm, cancel, or complete an appointment.
async function updateAppointment(id, action) {
    try {
        setUpdatingId(id);
        setError("");

        let updatedAppointment;

        if (action === "confirm") {
            updatedAppointment = await confirmAppointment(SHOP_ID, id);
        } else if (action === "cancel") {
            updatedAppointment = await cancelAppointment(SHOP_ID, id);
        } else if (action === "complete") {
            updatedAppointment = await completeAppointment(SHOP_ID, id);
        }

        setAppointments((previous) =>
            previous.map((appointment) =>
                appointment.id === id
                    ? updatedAppointment
                    : appointment
            )
        );

        if (selectedAppointment?.id === id) {
            setSelectedAppointment(updatedAppointment);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setUpdatingId(null);
    }
}

// Convert service IDs into service names.
function getServiceNames(serviceIds) {
    if (!serviceIds || serviceIds.length === 0) {
        return [];
    }

    return serviceIds.map((id) => {
        const service = services.find(
            (item) => Number(item.id) === Number(id)
        );

        return service?.name || `Service #${id}`;
    });
}

// Dashboard statistics.
const pending = appointments.filter(
    (a) => a.status === "PENDING"
).length;

const confirmed = appointments.filter(
    (a) => a.status === "CONFIRMED"
).length;

const completed = appointments.filter(
    (a) => a.status === "COMPLETED"
).length;

const cancelled = appointments.filter(
    (a) => a.status === "CANCELLED"
).length;

const totalRevenue = appointments
    .filter((a) => a.status === "COMPLETED")
    .reduce(
        (total, a) => total + Number(a.totalPrice || 0),
        0
    );

// Apply status and calendar filters.
const filteredAppointments = appointments.filter((a) => {
    const matchesStatus =
        filter === "ALL" || a.status === filter;

    const matchesDate =
        !selectedDate || a.appointmentDate === selectedDate;

    return matchesStatus && matchesDate;
});

function formatDate(date) {
    if (!date) return "—";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

function formatPrice(price) {
    return `${Number(price || 0).toLocaleString()} ETB`;
}

function getDateKey(year, month, day) {
    return [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0"),
    ].join("-");
}

function getAppointmentsForDate(date) {
    return appointments.filter(
        (appointment) => appointment.appointmentDate === date
    ).length;
}

function changeMonth(direction) {
    setCalendarMonth((current) =>
        new Date(
            current.getFullYear(),
            current.getMonth() + direction,
            1
        )
    );
}

// Render calendar.
function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
        cells.push(
            <div
                className="calendar-day empty"
                key={`empty-${i}`}
            />
        );
    }

    const today = getDateKey(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
    );

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = getDateKey(year, month, day);
        const bookingCount = getAppointmentsForDate(dateKey);

        const isToday = dateKey === today;
        const isSelected = dateKey === selectedDate;

        cells.push(
            <button
                type="button"
                key={dateKey}
                className={[
                    "calendar-day",
                    bookingCount > 0 ? "has-bookings" : "",
                    isToday ? "calendar-today" : "",
                    isSelected ? "calendar-selected" : "",
                ].join(" ")}
                onClick={() => {
                    setSelectedDate(isSelected ? null : dateKey);
                }}
                aria-label={`${day}, ${bookingCount} appointments`}
            >
                <span>{day}</span>

                {bookingCount > 0 && (
                    <small>{bookingCount}</small>
                )}
            </button>
        );
    }

    return cells;
}

const monthName = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
});

return (
    <div className="dashboard">

        <aside className="dashboard-sidebar">

            <div className="dashboard-logo">
                <span>K.</span>
                <div>
                    <strong>KINGS</strong>
                    <small>BARBER STUDIO</small>
                </div>
            </div>

            <div className="sidebar-label">
                MANAGEMENT
            </div>

            <a href="#dashboard-home" className="sidebar-link active">
                <span>▦</span>
                Dashboard
            </a>

            <a href="#calendar" className="sidebar-link">
                <span>▦</span>
                Calendar
            </a>

            <a href="#appointments" className="sidebar-link">
                <span>▤</span>
                Appointments
            </a>

            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {barberUser?.name?.charAt(0)?.toUpperCase() || "B"}
                    </div>

                    <div>
                        <strong>{barberUser?.name || "Barber"}</strong>
                        <small>Barber account</small>
                    </div>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={onLogout}
                >
                    ↗ Sign out
                </button>
            </div>

        </aside>

        <main className="dashboard-main" id="dashboard-home">

            <header className="dashboard-header">

                <div>
                    <p className="dashboard-eyebrow">
                        KINGS BARBER STUDIO
                    </p>

                    <h1>Dashboard</h1>

                    <p className="dashboard-subtitle">
                        Welcome back, {barberUser?.name}.
                        Here's your appointment overview.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-button"
                    onClick={loadAppointments}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </header>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {/* NEW APPOINTMENT NOTIFICATION */}

            {notification && (
                <div
                    className="new-appointment-notification"
                    role="status"
                >
                    <div>
                        <strong>🔔 New Appointment!</strong>
                        <p>
                            {notification.customerName} has booked an appointment.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedAppointment(notification);
                            setNotification(null);
                        }}
                    >
                        View Appointment
                    </button>

                    <button
                        type="button"
                        onClick={() => setNotification(null)}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="stats-grid">

                <div className="stat-card">
                    <span>Total appointments</span>
                    <strong>{appointments.length}</strong>
                    <small>All bookings</small>
                </div>

                <div className="stat-card">
                    <span>Pending</span>
                    <strong>{pending}</strong>
                    <small>Awaiting confirmation</small>
                </div>

                <div className="stat-card">
                    <span>Confirmed</span>
                    <strong>{confirmed}</strong>
                    <small>Upcoming appointments</small>
                </div>

                <div className="stat-card">
                    <span>Completed</span>
                    <strong>{completed}</strong>
                    <small>Finished appointments</small>
                </div>

            </section>

            <section className="revenue-card">

                <div>
                    <p>COMPLETED APPOINTMENT REVENUE</p>
                    <h2>{formatPrice(totalRevenue)}</h2>
                    <span>Based on completed appointments</span>
                </div>

                <div className="revenue-icon">
                    ETB
                </div>

            </section>

            {/* BOOKING CALENDAR */}

            <section className="calendar-section" id="calendar">

                <div className="calendar-heading">
                    <div>
                        <p className="dashboard-eyebrow">
                            APPOINTMENT SCHEDULE
                        </p>

                        <h2>Booking Calendar</h2>

                        <p className="calendar-description">
                            Select a date to view its appointments.
                        </p>
                    </div>

                    <div className="calendar-navigation">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            aria-label="Previous month"
                        >
                            ‹
                        </button>

                        <strong>{monthName}</strong>

                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            aria-label="Next month"
                        >
                            ›
                        </button>
                    </div>
                </div>

                <div className="calendar-weekdays">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <div key={day}>{day}</div>
                        )
                    )}
                </div>

                <div className="calendar-grid">
                    {renderCalendar()}
                </div>

                <div className="calendar-legend">
                    <span>
                        <i className="legend-dot today-dot" />
                        Today
                    </span>

                    <span>
                        <i className="legend-dot booking-dot" />
                        Has appointments
                    </span>

                    <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                    >
                        Show all dates
                    </button>
                </div>

            </section>

            {/* APPOINTMENT MANAGEMENT */}

            <section className="appointments-section" id="appointments">

                <div className="appointments-heading">
                    <div>
                        <p className="dashboard-eyebrow">
                            BOOKING MANAGEMENT
                        </p>

                        <h2>Appointments</h2>

                        {selectedDate && (
                            <p className="selected-date-label">
                                Showing appointments for {formatDate(selectedDate)}
                            </p>
                        )}
                    </div>

                    <span className="appointment-count">
                        {filteredAppointments.length} bookings
                    </span>
                </div>

                <div className="appointment-filters">

                    {[
                        "ALL",
                        "PENDING",
                        "CONFIRMED",
                        "COMPLETED",
                        "CANCELLED",
                    ].map((status) => (
                        <button
                            type="button"
                            key={status}
                            className={filter === status ? "filter-active" : ""}
                            onClick={() => setFilter(status)}
                        >
                            {status === "ALL"
                                ? "All"
                                : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}

                </div>

                {loading ? (
                    <div className="dashboard-empty">
                        Loading appointments...
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="dashboard-empty">
                        <span>▤</span>
                        <h3>No appointments found</h3>
                        <p>
                            There are no bookings matching your selection.
                        </p>
                    </div>
                ) : (

                    <div className="appointment-list">

                        {filteredAppointments.map((appointment) => (

                            <article
                                className="appointment-card"
                                key={appointment.id}
                            >

                                <div className="appointment-customer">

                                    <div className="customer-avatar">
                                        {appointment.customerName
                                            ?.charAt(0)
                                            ?.toUpperCase() || "C"}
                                    </div>

                                    <div>
                                        <h3>{appointment.customerName}</h3>
                                        <p>{appointment.customerPhone}</p>
                                        <small>
                                            Appointment #{appointment.id}
                                        </small>
                                    </div>

                                </div>

                                <div className="appointment-details">

                                    <div>
                                        <span>DATE</span>
                                        <strong>
                                            {formatDate(appointment.appointmentDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>TIME</span>
                                        <strong>
                                            {appointment.startTime} – {appointment.endTime}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>CUSTOMERS</span>
                                        <strong>
                                            {appointment.adultCount || 0} Adults,{" "}
                                            {appointment.childCount || 0} Children
                                        </strong>
                                    </div>

                                    <div>
                                        <span>TOTAL</span>
                                        <strong className="appointment-price">
                                            {formatPrice(appointment.totalPrice)}
                                        </strong>
                                    </div>

                                </div>

                                <div className="appointment-footer">

                                    <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
                                        {appointment.status}
                                    </span>

                                    <div className="appointment-actions">

                                        <button
                                            type="button"
                                            className="view-details-button"
                                            onClick={() => setSelectedAppointment(appointment)}
                                        >
                                            View Details
                                        </button>

                                        {appointment.status === "PENDING" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="action-confirm"
                                                    disabled={updatingId === appointment.id}
                                                    onClick={() =>
                                                        updateAppointment(appointment.id, "confirm")
                                                    }
                                                >
                                                    Confirm
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-cancel"
                                                    disabled={updatingId === appointment.id}
                                                    onClick={() =>
                                                        updateAppointment(appointment.id, "cancel")
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {appointment.status === "CONFIRMED" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="action-complete"
                                                    disabled={updatingId === appointment.id}
                                                    onClick={() =>
                                                        updateAppointment(appointment.id, "complete")
                                                    }
                                                >
                                                    Complete
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-cancel"
                                                    disabled={updatingId === appointment.id}
                                                    onClick={() =>
                                                        updateAppointment(appointment.id, "cancel")
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {updatingId === appointment.id && (
                                            <span className="updating-text">
                                                Updating...
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

                <p className="cancelled-summary">
                    Cancelled appointments: {cancelled}
                </p>

            </section>

        </main>

        {/* APPOINTMENT DETAILS POPUP */}

        {selectedAppointment && (
            <div
                className="appointment-modal-overlay"
                onClick={() => setSelectedAppointment(null)}
            >
                <div
                    className="appointment-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="appointment-modal-title"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="appointment-modal-header">
                        <div>
                            <p className="dashboard-eyebrow">
                                BOOKING INFORMATION
                            </p>

                            <h2 id="appointment-modal-title">
                                Appointment #{selectedAppointment.id}
                            </h2>
                        </div>

                        <button
                            type="button"
                            className="modal-close-button"
                            onClick={() => setSelectedAppointment(null)}
                            aria-label="Close details"
                        >
                            ×
                        </button>
                    </div>

                    <div className="modal-status-row">
                        <span className={`status-badge ${selectedAppointment.status?.toLowerCase()}`}>
                            {selectedAppointment.status}
                        </span>
                    </div>

                    <div className="modal-detail-section">
                        <h3>Customer information</h3>

                        <div className="modal-info-grid">
                            <div>
                                <span>Customer name</span>
                                <strong>{selectedAppointment.customerName}</strong>
                            </div>

                            <div>
                                <span>Phone number</span>
                                <strong>{selectedAppointment.customerPhone}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="modal-detail-section">
                        <h3>Appointment schedule</h3>

                        <div className="modal-info-grid">
                            <div>
                                <span>Date</span>
                                <strong>
                                    {formatDate(selectedAppointment.appointmentDate)}
                                </strong>
                            </div>

                            <div>
                                <span>Time</span>
                                <strong>
                                    {selectedAppointment.startTime} – {selectedAppointment.endTime}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="modal-detail-section">
                        <h3>Customers</h3>

                        <div className="modal-info-grid">
                            <div>
                                <span>Adults</span>
                                <strong>{selectedAppointment.adultCount || 0}</strong>
                            </div>

                            <div>
                                <span>Children</span>
                                <strong>{selectedAppointment.childCount || 0}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="modal-detail-section">
                        <h3>Selected services</h3>

                        <div className="modal-service-group">
                            <strong>Adult services</strong>

                            {(selectedAppointment.adultServiceIds || []).length > 0 ? (
                                <ul>
                                    {getServiceNames(selectedAppointment.adultServiceIds).map(
                                        (name, index) => (
                                            <li key={`adult-${index}`}>{name}</li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p>No adult services selected.</p>
                            )}
                        </div>

                        <div className="modal-service-group">
                            <strong>Child services</strong>

                            {(selectedAppointment.childServiceIds || []).length > 0 ? (
                                <ul>
                                    {getServiceNames(selectedAppointment.childServiceIds).map(
                                        (name, index) => (
                                            <li key={`child-${index}`}>{name}</li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p>No child services selected.</p>
                            )}
                        </div>
                    </div>

                    <div className="modal-total">
                        <span>Total appointment price</span>
                        <strong>
                            {formatPrice(selectedAppointment.totalPrice)}
                        </strong>
                    </div>

                    <div className="modal-appointment-actions">
                        {selectedAppointment.status === "PENDING" && (
                            <>
                                <button
                                    type="button"
                                    className="action-confirm"
                                    disabled={updatingId === selectedAppointment.id}
                                    onClick={() =>
                                        updateAppointment(selectedAppointment.id, "confirm")
                                    }
                                >
                                    {updatingId === selectedAppointment.id
                                        ? "Updating..."
                                        : "Confirm Appointment"}
                                </button>

                                <button
                                    type="button"
                                    className="action-cancel"
                                    disabled={updatingId === selectedAppointment.id}
                                    onClick={() =>
                                        updateAppointment(selectedAppointment.id, "cancel")
                                    }
                                >
                                    {updatingId === selectedAppointment.id
                                        ? "Updating..."
                                        : "Cancel Appointment"}
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            className="modal-done-button"
                            onClick={() => setSelectedAppointment(null)}
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
);


}

export default BarberDashboard;
