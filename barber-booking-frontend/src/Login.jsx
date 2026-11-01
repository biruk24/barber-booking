import { useState } from "react";
import { loginBarber } from "./api";
import "./Login.css";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
        const response = await loginBarber(
            email.trim(),
            password
        );

        if (!response?.token) {
            throw new Error("Login response did not contain a token.");
        }

        if (response.role !== "BARBER") {
            throw new Error("Only barber accounts can access this dashboard.");
        }

        localStorage.setItem("token", response.token);

        localStorage.setItem(
            "barberUser",
            JSON.stringify({
                id: response.id,
                name: response.name,
                email: response.email,
                role: response.role,
            })
        );

        onLogin(response);
    } catch (err) {
        setError(err.message || "Unable to log in. Please try again.");
    } finally {
        setLoading(false);
    }
}

return (
    <main className="login-page">
        <section className="login-container">

            <div className="login-brand">
                <span className="login-brand-icon">K</span>
                <span>KINGS BARBER SHOP</span>
            </div>

            <div className="login-heading">
                <span className="login-eyebrow">
                    BARBER MANAGEMENT
                </span>

                <h1>Welcome back.</h1>

                <p>
                    Sign in to manage your appointments,
                    customers, and daily bookings.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">

                <div className="login-field">
                    <label htmlFor="email">Email address</label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="login-field">
                    <label htmlFor="password">Password</label>

                    <div className="password-wrapper">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="login-error" role="alert">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="login-submit"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>

            </form>

            <div className="login-footer">
                <span>© {new Date().getFullYear()} Kings Barber Shop</span>
                <span>Barber Management Portal</span>
            </div>

        </section>
    </main>
);


}
