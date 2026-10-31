


import React, { usEffect, useState } from "react";
import "./App.css";
import Booking from "./Booking";
import { getShopServices } from "./api";

const SHOP_ID = 1;

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getShopServices(SHOP_ID)
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServiceError("Unable to load services right now."))
      .finally(() => setLoading(false));
  }, []);

  const haircut = services.find(
    (service) => service.name?.trim().toLowerCase() === "haircut"
  );

  const beardTrim = services.find(
    (service) => service.name?.trim().toLowerCase() === "beard trim"
  );

  const bookingServices = { haircut, beardTrim };

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="site">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="Kings home">
          <span className="brand-mark">K</span>
          <span className="brand-name">
            KINGS<span>BARBER</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <button onClick={() => scrollTo("home")}>Home</button>
          <button onClick={() => scrollTo("services")}>Services</button>
          <button onClick={() => scrollTo("about")}>Our Story</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
          <button className="nav-book" onClick={scrollToBooking}>
            Book a Visit <span>↗</span>
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image"></div>
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <p className="eyebrow">
              <span></span> THE ART OF GROOMING
            </p>

            <h1>
              OWN YOUR
              <br />
              <em>LOOK.</em>
            </h1>

            <p className="hero-description">
              Precision cuts. Timeless style. A grooming experience designed
              around you.
            </p>

            <div className="hero-actions">
              <button className="button-primary" onClick={scrollToBooking}>
                BOOK YOUR APPOINTMENT <span>↗</span>
              </button>
              <button
                className="button-text"
                onClick={() => scrollTo("services")}
              >
                EXPLORE SERVICES <span>↓</span>
              </button>
            </div>
          </div>

          <div className="hero-bottom">
            <span>EST. FOR THE MODERN GENTLEMAN</span>
            <span>ADDIS ABABA · ETHIOPIA</span>
          </div>

          <div className="hero-number">01 / 04</div>
        </section>

        <section className="intro-section">
          <div className="intro-label">MORE THAN A HAIRCUT</div>
          <div className="intro-copy">
            <h2>
              Style is personal.
              <br />
              <span>Make it unforgettable.</span>
            </h2>
            <p>
              At Kings Barber, every detail matters. From the first consultation
              to the final touch, we bring together craftsmanship, confidence,
              and a little luxury.
            </p>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark-eyebrow">THE KINGS EXPERIENCE</p>
              <h2>Our Services<span>.</span></h2>
            </div>
            <p className="section-note">
              The essentials, perfected.
              <br />
              No shortcuts. Just great work.
            </p>
          </div>

          {loading ? (
            <p className="service-message">Loading our services...</p>
          ) : serviceError ? (
            <p className="service-message">{serviceError}</p>
          ) : (
            <div className="service-grid">
              {haircut && (
                <article className="service-card">
                  <div className="service-image haircut-image">
                    <span>01</span>
                  </div>
                  <div className="service-card-content">
                    <div>
                      <h3>Haircut</h3>
                      <p>Clean lines. Fresh confidence. Your signature look.</p>
                    </div>
                    <div className="service-price">
                      <span>FROM</span>
                      <strong>500 <small>ETB</small></strong>
                    </div>
                  </div>
                </article>
              )}

              {beardTrim && (
                <article className="service-card">
                  <div className="service-image beard-image">
                    <span>02</span>
                  </div>
                  <div className="service-card-content">
                    <div>
                      <h3>Beard Trim</h3>
                      <p>Defined edges and a perfectly finished beard.</p>
                    </div>
                    <div className="service-price">
                      <span>FROM</span>
                      <strong>300 <small>ETB</small></strong>
                    </div>
                  </div>
                </article>
              )}

              {!haircut && !beardTrim && (
                <p className="service-message">
                  No bookable services are currently available.
                </p>
              )}
            </div>
          )}

          <div className="services-bottom">
            <span>GOOD STYLE IS NEVER AN ACCIDENT.</span>
            <button onClick={scrollToBooking}>
              FIND YOUR TIME <span>↗</span>
            </button>
          </div>
        </section>

        <section className="story-section" id="about">
          <div className="story-image">
            <div className="story-image-caption">
              <span>THE KINGS STANDARD</span>
              <span>01 — CRAFTSMANSHIP</span>
            </div>
          </div>

          <div className="story-content">
            <p className="eyebrow dark-eyebrow">OUR PHILOSOPHY</p>
            <h2>
              Not just
              <br />
              a cut.
              <br />
              <em>A statement.</em>
            </h2>
            <p>
              We believe a great haircut does more than change how you look.
              It changes how you carry yourself. Our focus is simple: quality
              service, attention to detail, and a look that feels like you.
            </p>
            <button className="story-button" onClick={scrollToBooking}>
              EXPERIENCE KINGS <span>↗</span>
            </button>
          </div>
        </section>

        <section className="booking-banner">
          <div>
            <p className="eyebrow">YOUR CHAIR IS WAITING</p>
            <h2>
              Make time
              <br />
              for <em>yourself.</em>
            </h2>
          </div>
          <button className="button-primary" onClick={scrollToBooking}>
            RESERVE YOUR CHAIR <span>↗</span>
          </button>
        </section>

        <section className="booking-section" id="booking">
          <div className="booking-heading">
            <p className="eyebrow dark-eyebrow">THE NEXT STEP</p>
            <h2>Book your visit<span>.</span></h2>
            <p>
              Choose your services, find a time, and leave the rest to us.
            </p>
          </div>

          <Booking shopId={SHOP_ID} services={bookingServices} />
        </section>

        <section className="contact-section" id="contact">
          <div>
            <p className="eyebrow">COME THROUGH</p>
            <h2>Good things<br />happen in the chair.</h2>
          </div>
          <div className="contact-details">
            <div>
              <span>LOCATION</span>
              <p>Bole, Addis Ababa, Ethiopia</p>
            </div>
            <div>
              <span>PHONE</span>
              <p>Contact us to arrange your visit</p>
            </div>
            <button onClick={scrollToBooking}>
              BOOK AN APPOINTMENT <span>↗</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">K</span>
          <span className="brand-name">
            KINGS<span>BARBER</span>
          </span>
        </a>
        <p>CRAFTED WITH PRECISION. WORN WITH CONFIDENCE.</p>
        <span>© {new Date().getFullYear()} KINGS BARBER</span>
      </footer>

      <button className="floating-book" onClick={scrollToBooking}>
        <span className="floating-dot"></span>
        BOOK NOW <span>↗</span>
      </button>
    </div>
  );
}

export default App;

