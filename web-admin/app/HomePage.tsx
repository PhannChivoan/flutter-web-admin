"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-client";
import { ApiError, clearAuthTokens } from "@/lib/api";

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== "ADMIN") {
        clearAuthTokens();
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 md:p-20 antialiased"
      style={{
        background: "radial-gradient(circle at 50% 50%, #1a0506 0%, #080808 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        color: "#e5e2e1",
      }}
    >
      {/* Animated ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle at center, rgba(229,9,20,0.04) 0%, transparent 60%)",
          animation: "pulse 15s infinite alternate",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Background cinema image overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: 0.18,
          pointerEvents: "none",
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-Xtybxjl2x5GChqc5ZOLh8Q3_vknshEaeEyNsfFOIunSPovVyBdS5QK2rXs82gv7APYQ8Zm0XXlgsmnrnWUoacYf_W4fIkpyraHk1z11P9eRoGI_zB9JMLBXjtuin72jQYNq1ipSasoX32omvgLUjrfATwX-21UAyQWkWuaj4vj0bV8lFlKEC7kaItXt98-CNQTd2C3T7BcqEzfS2EMdMzLt5Reml4CbMOLlhvEePOStsyY_5FOgV9g8962EeHoqVr-iXULXTlgs_')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes pulse {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(2%, 2%); }
        }
        .input-field:focus {
          outline: none;
        }
        .input-wrap:focus-within {
          border-color: #e50914 !important;
          box-shadow: 0 0 15px rgba(229, 9, 20, 0.2);
        }
        .btn-login:hover {
          background-color: #c0000c !important;
          box-shadow: 0 0 22px rgba(229, 9, 20, 0.45);
          transform: translateY(-2px);
        }
        .forgot-link:hover {
          color: #ffffff;
        }
      `}</style>

      {/* Main card */}
      <main style={{ width: "100%", maxWidth: 440, zIndex: 10, position: "relative" }}>
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 48,
              lineHeight: "56px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            CinePremium
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c8c6c5",
              marginTop: 8,
            }}
          >
            Admin Portal
          </p>
        </div>

        {/* Glass card */}
        <div
          style={{
            background: "rgba(26, 26, 26, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 20,
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: 8,
                margin: "0 0 8px 0",
              }}
            >
              Secure Access
            </h2>
            <p style={{ fontSize: 16, color: "#e9bcb6", margin: 0 }}>
              Authenticate to manage cinematic experiences.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#c8c6c5",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Admin Email
              </label>
              <div
                className="input-wrap"
                style={{
                  position: "relative",
                  borderRadius: 8,
                  background: "#201f1f",
                  border: "1px solid #353534",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: 16,
                    color: "#e9bcb6",
                    fontSize: 20,
                    pointerEvents: "none",
                    fontFamily: "'Material Symbols Outlined'",
                  }}
                >
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cinepremium.com"
                  className="input-field"
                  style={{
                    width: "100%",
                    paddingLeft: 48,
                    paddingRight: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    background: "transparent",
                    border: "none",
                    color: "#ffffff",
                    fontSize: 16,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#c8c6c5",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Password
                </label>
                <a
                  href="#"
                  className="forgot-link"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#ffb4aa",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    letterSpacing: "0.05em",
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              <div
                className="input-wrap"
                style={{
                  position: "relative",
                  borderRadius: 8,
                  background: "#201f1f",
                  border: "1px solid #353534",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: 16,
                    color: "#e9bcb6",
                    fontSize: 20,
                    pointerEvents: "none",
                  }}
                >
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{
                    width: "100%",
                    paddingLeft: 48,
                    paddingRight: 48,
                    paddingTop: 12,
                    paddingBottom: 12,
                    background: "transparent",
                    border: "none",
                    color: "#ffffff",
                    fontSize: 16,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 16,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#e9bcb6",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                    transition: "color 0.2s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", paddingTop: 8 }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: "1px solid #353534",
                  background: "#201f1f",
                  accentColor: "#e50914",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="remember-me"
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  color: "#e9bcb6",
                  cursor: "pointer",
                }}
              >
                Keep me signed in
              </label>
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: "#ff8a80", fontSize: 13, fontWeight: 500, margin: 0 }}>{error}</p>
            )}

            {/* Submit */}
            <div style={{ paddingTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-login"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 8,
                  backgroundColor: "#e50914",
                  color: "#ffffff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Signing in..." : "Login to Dashboard"}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  login
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#353534", fontWeight: 500 }}>
            © 2024 CinePremium Internal Systems. All rights reserved.
          </p>
        </div>
      </main>

      {/* Material Icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}