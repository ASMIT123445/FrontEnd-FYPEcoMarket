import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaEnvelope, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaArrowLeft
} from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage({ type: "", text: "" });

    if (!email) {
      setMessage({ 
        type: "error", 
        text: "Email is required" 
      });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ 
        type: "error", 
        text: "Please enter a valid email address" 
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/forgot-password/", {
        email: email
      }, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        setEmailSent(true);
        setMessage({ 
          type: "success", 
          text: "Password reset link has been sent to your email!" 
        });
      }

    } catch (err) {
      console.error("Forgot password error:", err);
      
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setMessage({ 
        type: "error", 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-content">
          <div className="forgot-password-header">
            <h2>Forgot Password?</h2>
            <p>Enter your email address and we'll send you a link to reset your password</p>
          </div>

          {/* Success/Error Messages */}
          {message.type === "success" && (
            <div className="alert success">
              <FaCheckCircle /> {message.text}
            </div>
          )}
          
          {message.type === "error" && (
            <div className="alert error">
              <FaExclamationCircle /> {message.text}
            </div>
          )}

          {!emailSent ? (
            <form className="forgot-password-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`btn-submit ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinning" /> : <FaEnvelope />}
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
              </button>
            </form>
          ) : (
            <div className="email-sent-message">
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h3>Check Your Email</h3>
              <p>We've sent a password reset link to:</p>
              <p className="email-display">{email}</p>
              <p className="help-text">
                Click the link in the email to reset your password. 
                If you don't see it, check your spam folder.
              </p>
              <button 
                className="btn-resend"
                onClick={() => {
                  setEmailSent(false);
                  setMessage({ type: "", text: "" });
                }}
              >
                Send Another Email
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="back-to-login">
            <Link to="/login" className="back-link">
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>

          {/* Info */}
          <div className="demo-info">
            <h4><FaInfoCircle /> Reset Password Info</h4>
            <p>• Reset links expire after 1 hour for security</p>
            <p>• Check your spam folder if you don't see the email</p>
            <p>• Contact support if you continue having issues</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .forgot-password-page {
          background-color: #F9F7F3;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-image: url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80');
          background-size: cover;
          background-position: center;
          background-blend-mode: overlay;
          background-color: rgba(249, 247, 243, 0.9);
        }

        .forgot-password-container {
          width: 100%;
          max-width: 500px;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .forgot-password-content {
          background-color: white;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .forgot-password-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .forgot-password-header h2 {
          font-size: 2.2rem;
          color: #1B5E20;
          margin-bottom: 10px;
        }

        .forgot-password-header p {
          color: #666666;
          font-size: 1.1rem;
          line-height: 1.5;
        }

        .forgot-password-form {
          width: 100%;
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333333;
          font-size: 0.95rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666666;
          font-size: 16px;
        }

        .form-control {
          width: 100%;
          padding: 14px 15px 14px 45px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s;
          background-color: #f9f9f9;
        }

        .form-control:focus {
          outline: none;
          border-color: #2E7D32;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .btn-submit {
          width: 100%;
          padding: 16px;
          background-color: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .email-sent-message {
          text-align: center;
          padding: 20px 0;
        }

        .success-icon {
          font-size: 48px;
          color: #4CAF50;
          margin-bottom: 20px;
        }

        .email-sent-message h3 {
          font-size: 1.5rem;
          color: #1B5E20;
          margin-bottom: 15px;
        }

        .email-sent-message p {
          color: #666666;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .email-display {
          font-weight: 600;
          color: #2E7D32;
          background-color: rgba(76, 175, 80, 0.1);
          padding: 10px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .help-text {
          font-size: 0.9rem;
          margin-bottom: 25px;
        }

        .btn-resend {
          background-color: transparent;
          color: #2E7D32;
          border: 2px solid #2E7D32;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-resend:hover {
          background-color: #2E7D32;
          color: white;
        }

        .back-to-login {
          text-align: center;
          margin: 25px 0;
        }

        .back-link {
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: #1B5E20;
          text-decoration: underline;
        }

        .demo-info {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #2E7D32;
          padding: 15px;
          margin-top: 25px;
          border-radius: 8px;
        }

        .demo-info h4 {
          color: #1B5E20;
          margin-bottom: 10px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .demo-info p {
          font-size: 0.85rem;
          color: #666666;
          margin-bottom: 5px;
        }

        .alert {
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert.success {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
          color: #1B5E20;
        }

        .alert.error {
          background-color: rgba(244, 67, 54, 0.1);
          border-left: 4px solid #f44336;
          color: #f44336;
        }

        @media (max-width: 768px) {
          .forgot-password-page {
            padding: 10px;
          }
          
          .forgot-password-content {
            padding: 30px 20px;
          }
          
          .forgot-password-header h2 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

