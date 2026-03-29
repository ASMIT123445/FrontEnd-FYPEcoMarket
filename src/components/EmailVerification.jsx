import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaSpinner } from "react-icons/fa";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/verify-email/", {
        email: email,
        code: verificationCode
      });

      // Store tokens for auto-login
      if (response.data.access && response.data.refresh) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
      }

      // Set welcome flag
      localStorage.setItem('justRegistered', 'true');

      alert(response.data.message);

      // Redirect based on role
      if (response.data.role === "seller") {
        navigate("/seller/onboarding");
      } else {
        navigate("/main");
      }

    } catch (error) {
      setError(error.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="logo-section">
          <FaLeaf className="logo-icon" />
          <h1>Ecomarket</h1>
        </div>
        
        <div className="verification-content">
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit verification code to:</p>
          <p className="email-display">{email}</p>
          
          <form onSubmit={handleVerification} className="verification-form">
            <div className="form-group">
              <label htmlFor="code">Enter Verification Code</label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="code-input"
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="verify-btn">
              {loading ? <FaSpinner className="spinning" /> : null}
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
          
          <div className="help-text">
            <p>Didn't receive the code? Check your spam folder or</p>
            <button 
              className="link-btn" 
              onClick={() => navigate("/register")}
            >
              register again
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .verification-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
          padding: 20px;
        }
        
        .verification-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .logo-section {
          margin-bottom: 30px;
        }
        
        .logo-icon {
          font-size: 48px;
          color: #2E7D32;
          margin-bottom: 10px;
        }
        
        .logo-section h1 {
          font-size: 32px;
          color: #2E7D32;
          margin: 0;
          font-weight: 700;
        }
        
        .verification-content h2 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #333;
        }
        
        .verification-content p {
          font-size: 16px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .email-display {
          font-weight: 600;
          color: #2E7D32;
          background: #f0f8f0;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        
        .verification-form {
          margin-bottom: 25px;
        }
        
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        
        .code-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 18px;
          text-align: center;
          letter-spacing: 4px;
          font-weight: 600;
          transition: border-color 0.3s;
        }
        
        .code-input:focus {
          outline: none;
          border-color: #2E7D32;
        }
        
        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 14px;
        }
        
        .verify-btn {
          width: 100%;
          background: #2E7D32;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .verify-btn:hover:not(:disabled) {
          background: #1B5E20;
        }
        
        .verify-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .help-text {
          font-size: 14px;
          color: #666;
        }
        
        .link-btn {
          background: none;
          border: none;
          color: #2E7D32;
          cursor: pointer;
          text-decoration: underline;
          font-size: 14px;
        }
        
        .link-btn:hover {
          color: #1B5E20;
        }
        
        @media (max-width: 480px) {
          .verification-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}