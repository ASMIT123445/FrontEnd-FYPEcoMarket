import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaSpinner, FaCheckCircle, FaExclamationCircle,
  FaArrowLeft, FaKey, FaShieldAlt,
} from "react-icons/fa";

// Step labels
const STEPS = ["Username", "Email & OTP", "New Password"];

export default function ForgotPassword() {
  const navigate = useNavigate();

  // step: 1 = username, 2 = email + send OTP, 3 = enter OTP + new password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const clearMessages = () => { setError(""); setSuccess(""); };

  // ── Step 1: validate username exists ──────────────────────
  const handleUsernameNext = (e) => {
    e.preventDefault();
    clearMessages();
    if (!username.trim()) { setError("Username is required"); return; }
    setStep(2);
  };

  // ── Step 2: verify username+email match, send OTP ─────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address"); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password/otp/`, {
        username, email,
      });
      setSuccess(`OTP sent to ${email}. Check your inbox.`);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: verify OTP + reset password ───────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!otp.trim()) { setError("OTP is required"); return; }
    if (otp.length !== 6) { setError("OTP must be 6 digits"); return; }
    if (!password) { setError("New password is required"); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
    if (password !== password2) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password/otp/`, {
        username, email, otp, password, password2,
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">

        {/* Logo */}
        <div className="fp-logo">🌿 Ecomarket</div>

        {/* Step indicator */}
        <div className="fp-steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`fp-step ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
              <div className="fp-step-dot">{step > i + 1 ? "✓" : i + 1}</div>
              <span className="fp-step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="fp-step-line" />}
            </div>
          ))}
        </div>

        <h2 className="fp-title">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify Your Email"}
          {step === 3 && "Reset Password"}
        </h2>
        <p className="fp-subtitle">
          {step === 1 && "Enter your username to get started"}
          {step === 2 && "Enter the email linked to this account"}
          {step === 3 && "Enter the OTP and your new password"}
        </p>

        {/* Messages */}
        {error && (
          <div className="fp-alert fp-alert-error">
            <FaExclamationCircle /> {error}
          </div>
        )}
        {success && (
          <div className="fp-alert fp-alert-success">
            <FaCheckCircle /> {success}
          </div>
        )}

        {/* ── STEP 1: Username ── */}
        {step === 1 && (
          <form onSubmit={handleUsernameNext} className="fp-form">
            <div className="fp-field">
              <label>Username</label>
              <div className="fp-input-wrap">
                <FaUser className="fp-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="fp-btn">
              Continue <span>→</span>
            </button>
          </form>
        )}

        {/* ── STEP 2: Email ── */}
        {step === 2 && (
          <form onSubmit={handleSendOTP} className="fp-form">
            <div className="fp-field fp-field-readonly">
              <label>Username</label>
              <div className="fp-input-wrap">
                <FaUser className="fp-icon" />
                <input type="text" value={username} readOnly />
              </div>
            </div>
            <div className="fp-field">
              <label>Email Address</label>
              <div className="fp-input-wrap">
                <FaEnvelope className="fp-icon" />
                <input
                  type="email"
                  placeholder="Enter email linked to this account"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="fp-hint">Must match the email registered with this username</p>
            </div>
            <div className="fp-row">
              <button type="button" className="fp-btn fp-btn-outline" onClick={() => { clearMessages(); setStep(1); }}>
                ← Back
              </button>
              <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? <FaSpinner className="fp-spin" /> : <FaKey />}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: OTP + New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fp-form">
            <div className="fp-field">
              <label>OTP Code</label>
              <div className="fp-input-wrap">
                <FaShieldAlt className="fp-icon" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP from email"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>
            <div className="fp-field">
              <label>New Password</label>
              <div className="fp-input-wrap">
                <FaLock className="fp-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="fp-eye" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="fp-field">
              <label>Confirm Password</label>
              <div className="fp-input-wrap">
                <FaLock className="fp-icon" />
                <input
                  type={showPw2 ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                />
                <button type="button" className="fp-eye" onClick={() => setShowPw2(p => !p)}>
                  {showPw2 ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="fp-row">
              <button type="button" className="fp-btn fp-btn-outline"
                onClick={() => { clearMessages(); setOtp(""); setPassword(""); setPassword2(""); setStep(2); }}>
                ← Back
              </button>
              <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? <FaSpinner className="fp-spin" /> : <FaLock />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <div className="fp-back-login">
          <Link to="/login"><FaArrowLeft /> Back to Login</Link>
        </div>
      </div>

      <style>{`
        .fp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-image: url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80');
          background-size: cover;
          background-position: center;
          background-color: rgba(249,247,243,0.88);
          background-blend-mode: overlay;
        }
        .fp-card {
          background: white;
          border-radius: 24px;
          padding: 44px 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .fp-logo {
          text-align: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: #2E7D32;
          margin-bottom: 28px;
        }

        /* Step indicator */
        .fp-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 28px;
        }
        .fp-step {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
        }
        .fp-step-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e8ecf0;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .fp-step.active .fp-step-dot {
          background: #2E7D32;
          color: white;
          box-shadow: 0 0 0 4px rgba(46,125,50,0.15);
        }
        .fp-step.done .fp-step-dot {
          background: #4CAF50;
          color: white;
        }
        .fp-step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          white-space: nowrap;
        }
        .fp-step.active .fp-step-label { color: #2E7D32; }
        .fp-step.done .fp-step-label { color: #4CAF50; }
        .fp-step-line {
          width: 32px;
          height: 2px;
          background: #e8ecf0;
          margin: 0 6px;
          flex-shrink: 0;
        }
        .fp-step.done + .fp-step .fp-step-line,
        .fp-step.done .fp-step-line { background: #4CAF50; }

        .fp-title {
          text-align: center;
          font-size: 1.7rem;
          font-weight: 800;
          color: #1B5E20;
          margin: 0 0 6px;
        }
        .fp-subtitle {
          text-align: center;
          color: #64748b;
          font-size: 0.92rem;
          margin: 0 0 24px;
        }

        /* Alerts */
        .fp-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .fp-alert-error {
          background: rgba(244,67,54,0.08);
          border-left: 4px solid #f44336;
          color: #c62828;
        }
        .fp-alert-success {
          background: rgba(76,175,80,0.1);
          border-left: 4px solid #4CAF50;
          color: #1B5E20;
        }

        /* Form */
        .fp-form { display: flex; flex-direction: column; gap: 18px; }
        .fp-field { display: flex; flex-direction: column; gap: 7px; }
        .fp-field label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .fp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fp-icon {
          position: absolute;
          left: 14px;
          color: #9aa0a6;
          font-size: 0.9rem;
          pointer-events: none;
        }
        .fp-input-wrap input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 0.95rem;
          background: #f9f9f9;
          color: #1a1a2e;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .fp-input-wrap input:focus {
          border-color: #2E7D32;
          background: white;
          box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
        }
        .fp-field-readonly .fp-input-wrap input {
          background: #f1f3f4;
          color: #64748b;
          cursor: default;
        }
        .fp-eye {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #9aa0a6;
          cursor: pointer;
          font-size: 0.95rem;
          padding: 4px;
        }
        .fp-hint {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 0;
        }

        /* Buttons */
        .fp-btn {
          flex: 1;
          padding: 14px;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .fp-btn:hover:not(:disabled) {
          background: #1B5E20;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(46,125,50,0.3);
        }
        .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .fp-btn-outline {
          background: transparent;
          color: #2E7D32;
          border: 2px solid #2E7D32;
        }
        .fp-btn-outline:hover:not(:disabled) {
          background: rgba(46,125,50,0.06);
          box-shadow: none;
        }
        .fp-row { display: flex; gap: 12px; }
        .fp-spin { animation: fp-spin 0.8s linear infinite; }
        @keyframes fp-spin { to { transform: rotate(360deg); } }

        .fp-back-login {
          text-align: center;
          margin-top: 24px;
        }
        .fp-back-login a {
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.88rem;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .fp-back-login a:hover { text-decoration: underline; }

        @media (max-width: 520px) {
          .fp-card { padding: 32px 20px; }
          .fp-title { font-size: 1.4rem; }
          .fp-step-label { display: none; }
          .fp-step-line { width: 20px; }
        }
      `}</style>
    </div>
  );
}
