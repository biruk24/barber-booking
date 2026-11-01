import { useEffect, useState } from "react";
import Booking from "./Booking";
import Login from "./Login";
import BarberDashboard from "./BarberDashboard";

import {
  getShop,
  getShopServices,
} from "./api";

import "./App.css";

const SHOP_ID = 1;

function App() {
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


const [currentPath, setCurrentPath] = useState(
    window.location.pathname
);

const [barberUser, setBarberUser] = useState(() => {
    try {
        const savedUser = localStorage.getItem("barberUser");
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        return null;
    }
});

// Handle browser back and forward buttons.
useEffect(() => {
    const handlePopState = () => {
        setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
        window.removeEventListener("popstate", handlePopState);
    };
}, []);

// Navigate between pages without reloading.
function navigate(path) {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
}

// Handle successful barber login.
function handleLogin(response) {
    const user = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
    };

    setBarberUser(user);
    localStorage.setItem("barberUser", JSON.stringify(user));

    navigate("/barber/dashboard");
}

// Handle barber logout.
function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("barberUser");

    setBarberUser(null);
    navigate("/");
}

// Protect the barber dashboard.
useEffect(() => {
    if (
        currentPath === "/barber/dashboard" &&
        (!localStorage.getItem("token") || !barberUser)
    ) {
        navigate("/barber/login");
    }
}, [currentPath, barberUser]);

// Load public shop information.
useEffect(() => {
    async function loadData() {
        try {
            const [shopData, serviceData] = await Promise.all([
                getShop(SHOP_ID),
                getShopServices(SHOP_ID),
            ]);

            setShop(shopData);

            setServices(
                Array.isArray(serviceData) ? serviceData : []
            );
        } catch (err) {
            console.error("Failed to load shop:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    loadData();
}, []);

// Find haircut service.
const haircut = services.find(
    (service) =>
        service.name?.trim().toLowerCase() === "haircut"
);

// Find beard trim service.
const beardTrim = services.find(
    (service) =>
        service.name?.trim().toLowerCase() === "beard trim"
);

// Scroll to booking section.
const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({
        behavior: "smooth",
    });
};

// =====================================================
// BARBER LOGIN PAGE
// =====================================================

if (currentPath === "/barber/login") {
    return (
        <Login onLogin={handleLogin} />
    );
}

// =====================================================
// BARBER DASHBOARD
// =====================================================

if (currentPath === "/barber/dashboard") {
    if (!barberUser || !localStorage.getItem("token")) {
        return null;
    }

    return (
        <BarberDashboard
            barberUser={barberUser}
            onLogout={handleLogout}
        />
    );
}

// =====================================================
// PUBLIC WEBSITE LOADING
// =====================================================

if (loading) {
    return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Preparing your experience...</p>
        </div>
    );
}

if (error) {
    return (
        <div className="error-screen">
            <h2>Unable to load the shop</h2>
            <p>{error}</p>

            <button onClick={() => window.location.reload()}>
                Try Again
            </button>
        </div>
    );
}

// =====================================================
// PUBLIC CUSTOMER WEBSITE
// =====================================================

return (
    <div className="website">

        <header className="navbar">

            <a href="#home" className="logo">
                <span className="logo-mark">K.</span>

                <span>
                    <strong>{shop?.name || "KINGS"}</strong>
                    <small>BARBER STUDIO</small>
                </span>
            </a>

            <nav>
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#story">Our Story</a>
                <a href="#contact">Contact</a>
            </nav>

            <button
                className="nav-button"
                onClick={scrollToBooking}
            >
                Book Appointment
            </button>

        </header>

        <main>

            {/* HERO SECTION */}

            <section className="hero" id="home">

                <div className="hero-content">

                    <p className="eyebrow">
                        THE ART OF GROOMING
                    </p>

                    <h1>
                        YOUR STYLE.
                        <br />
                        YOUR <span>STATEMENT.</span>
                    </h1>

                    <p className="hero-description">
                        More than a haircut. Experience professional
                        grooming, attention to detail, and a style
                        that speaks for itself.
                    </p>

                    <div className="hero-actions">

                        <button
                            className="primary-button"
                            onClick={scrollToBooking}
                        >
                            Book Your Visit <span>↗</span>
                        </button>

                        <a href="#services" className="text-button">
                            Explore Services ↓
                        </a>

                    </div>

                    <div className="hero-bottom">

                        <div>
                            <strong>01</strong>
                            <span>Professional service</span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>Personal attention</span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>Easy online booking</span>
                        </div>

                    </div>

                </div>

                <div className="hero-image">
                    <div className="image-overlay"></div>

                    <div className="image-caption">
                        <span>PRECISION</span>
                        <span>STYLE</span>
                        <span>CONFIDENCE</span>
                    </div>
                </div>

            </section>

            {/* SERVICES SECTION */}

            <section className="services-section" id="services">

                <div className="section-heading">

                    <div>
                        <p className="eyebrow">WHAT WE OFFER</p>
                        <h2>THE SERVICES</h2>
                    </div>

                    <p>
                        Quality grooming with professional
                        attention to every detail.
                    </p>

                </div>

                <div className="service-grid">

                    <article className="service-card">

                        <span className="service-number">01</span>
                        <div className="service-icon">✂</div>

                        <h3>Classic Haircut</h3>

                        <p>
                            A clean, professional haircut designed
                            around your personal style.
                        </p>

                        <div className="service-price">
                            <span>Adult</span>
                            <strong>
                                {haircut?.adultPrice ?? 500} ETB
                            </strong>
                        </div>

                        <div className="service-price">
                            <span>Child</span>
                            <strong>
                                {haircut?.childPrice ?? 400} ETB
                            </strong>
                        </div>

                        <button onClick={scrollToBooking}>
                            Book this service ↗
                        </button>

                    </article>

                    <article className="service-card featured-service">

                        <span className="service-number">02</span>
                        <div className="service-icon">♧</div>

                        <h3>Beard Trim</h3>

                        <p>
                            Professional beard shaping and trimming
                            for a clean, confident look.
                        </p>

                        <div className="service-price">
                            <span>Adult</span>
                            <strong>
                                {beardTrim?.adultPrice ?? 300} ETB
                            </strong>
                        </div>

                        <div className="service-price">
                            <span>Adult haircut + beard</span>
                            <strong>700 ETB</strong>
                        </div>

                        <button onClick={scrollToBooking}>
                            Book this service ↗
                        </button>

                    </article>

                    <article className="service-card">

                        <span className="service-number">03</span>
                        <div className="service-icon">✦</div>

                        <h3>Complete Grooming</h3>

                        <p>
                            Combine haircut and beard trim for
                            a complete grooming experience.
                        </p>

                        <div className="service-price">
                            <span>Adult combo</span>
                            <strong>700 ETB</strong>
                        </div>

                        <button onClick={scrollToBooking}>
                            Book this service ↗
                        </button>

                    </article>

                </div>

            </section>

            {/* STORY SECTION */}

            <section className="story-section" id="story">

                <div className="story-image">
                    <div className="story-image-label">
                        THE KINGS EXPERIENCE
                    </div>
                </div>

                <div className="story-content">

                    <p className="eyebrow">
                        MORE THAN A BARBERSHOP
                    </p>

                    <h2>
                        GOOD STYLE
                        <br />
                        STARTS WITH
                        <br />
                        <span>THE DETAILS.</span>
                    </h2>

                    <p>
                        At {shop?.name || "Kings Barber Shop"},
                        we believe that looking good starts with
                        feeling confident. Our goal is to provide
                        professional grooming in a comfortable
                        environment.
                    </p>

                    <button
                        className="primary-button"
                        onClick={scrollToBooking}
                    >
                        Experience It <span>↗</span>
                    </button>

                </div>

            </section>

            {/* BOOKING BANNER */}

            <section className="booking-banner">

                <p className="eyebrow">
                    YOUR NEXT LOOK STARTS HERE
                </p>

                <h2>MAKE TIME FOR YOURSELF.</h2>

                <button
                    className="primary-button"
                    onClick={scrollToBooking}
                >
                    Reserve Your Appointment <span>↗</span>
                </button>

            </section>

            {/* BOOKING SECTION */}

            <section id="booking" className="booking-section">

                <div className="section-heading booking-heading">

                    <div>
                        <p className="eyebrow">
                            SIMPLE. QUICK. CONVENIENT.
                        </p>

                        <h2>BOOK YOUR VISIT</h2>
                    </div>

                    <p>
                        Choose your services, select a date and time,
                        and confirm your appointment.
                    </p>

                </div>

                <Booking
                    shopId={SHOP_ID}
                    haircut={haircut}
                    beardTrim={beardTrim}
                />

            </section>

        </main>

        {/* FOOTER */}

        <footer id="contact">

            <div className="footer-main">

                <div className="footer-brand">

                    <div className="logo">
                        <span className="logo-mark">K.</span>

                        <span>
                            <strong>{shop?.name || "KINGS"}</strong>
                            <small>BARBER STUDIO</small>
                        </span>
                    </div>

                    <p>
                        Professional grooming. Personal style.
                        A better experience.
                    </p>

                </div>

                <div className="footer-info">

                    <h4>CONTACT</h4>
                    <p>{shop?.phone || "Contact us for information"}</p>
                    <p>{shop?.address || "Visit our shop"}</p>

                </div>

                <div className="footer-info">

                    <h4>QUICK LINKS</h4>

                    <a href="#home">Home</a>
                    <a href="#services">Services</a>
                    <a href="#booking">Book Appointment</a>

                    <button
                        type="button"
                        onClick={() => navigate("/barber/login")}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            marginTop: "10px",
                            textAlign: "left",
                            color: "inherit",
                            cursor: "pointer",
                            font: "inherit",
                        }}
                    >
                        Barber Login ↗
                    </button>

                </div>

            </div>

            <div className="footer-bottom">

                <span>
                    © {new Date().getFullYear()}{" "}
                    {shop?.name || "Kings Barber Shop"}.
                </span>

                <span>CRAFTED WITH STYLE.</span>

            </div>

        </footer>

    </div>
);


}

export default App;
