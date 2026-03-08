import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaArrowLeft
} from "react-icons/fa";




export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    password2: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Validate that we have uid and token
    if (!uid || !token) {
      setMessage({
        type: "error",
        text: "Invalid reset link. Please request a new password reset."
      });
    }
  }, [uid, token]);

  const validatePassword = (password) => {
    return password.length >= 4;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (name === 'password' && validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
    if (name === 'password2' && value === formData.password) {
      setErrors(prev => ({ ...prev, password2: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage({ type: "", text: "" });
    setErrors({});

    const { password, password2 } = formData;
    let newErrors = {};

    // Validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!password2) {
      newErrors.password2 = "Please confirm your password";
    } else if (password !== password2) {
      newErrors.password2 = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!uid || !token) {
      setMessage({
        type: "error",
        text: "Invalid reset link. Please request a new password reset."
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/reset-password/", {
        uid: uid,
        token: token,
        password: password,
        password2: password2
      }, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        setResetSuccess(true);
        setMessage({ 
          type: "success", 
          text: "Password reset successful! You can now login with your new password." 
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }

    } catch (err) {
      console.error("Reset password error:", err);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
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
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-content">
          <div className="reset-password-header">
            <h2>Reset Your Password</h2>
            <p>Enter your new password below</p>
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

          {!resetSuccess ? (
            <form className="reset-password-form" onSubmit={handleSubmit}>
              {/* New Password Field */}
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="password2">Confirm New Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword2 ? "text" : "password"}
                    id="password2"
                    name="password2"
                    className={`form-control ${errors.password2 ? 'error' : ''}`}
                    placeholder="Confirm new password"
                    value={formData.password2}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword2(!showPassword2)}
                  >
                    {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password2 && (
                  <div className="error-message">{errors.password2}</div>
                )}
              </div>

              <button 
                type="submit" 
                className={`btn-submit ${loading ? 'loading' : ''}`}
                disabled={loading || !uid || !token}
              >
                {loading ? <FaSpinner className="spinning" /> : <FaLock />}
                <span>{loading ? "Resetting..." : "Reset Password"}</span>
              </button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h3>Password Reset Complete!</h3>
              <p>Your password has been successfully reset.</p>
              <p className="redirect-text">
                Redirecting to login page in 3 seconds...
              </p>
              <Link to="/login" className="btn-login">
                Go to Login Now
              </Link>
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
            <h4><FaInfoCircle /> Password Requirements</h4>
            <p>• Minimum 4 characters long</p>
            <p>• Both password fields must match</p>
            <p>• Reset links expire after 1 hour</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reset-password-page {
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

        .reset-password-container {
          width: 100%;
          max-width: 500px;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .reset-password-content {
          background-color: white;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .reset-password-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .reset-password-header h2 {
          font-size: 2.2rem;
          color: #1B5E20;
          margin-bottom: 10px;
        }

        .reset-password-header p {
          color: #666666;
          font-size: 1.1rem;
        }

        .reset-password-form {
          width: 100%;
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 20px;
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

        .form-control.error {
          border-color: #f44336;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666666;
          cursor: pointer;
          font-size: 16px;
        }

        .error-message {
          color: #f44336;
          font-size: 0.85rem;
          margin-top: 5px;
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
          margin-top: 25px;
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

        .success-message {
          text-align: center;
          padding: 20px 0;
        }

        .success-icon {
          font-size: 48px;
          color: #4CAF50;
          margin-bottom: 20px;
        }

        .success-message h3 {
          font-size: 1.5rem;
          color: #1B5E20;
          margin-bottom: 15px;
        }

        .success-message p {
          color: #666666;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .redirect-text {
          font-size: 0.9rem;
          color: #888;
          margin-bottom: 20px;
        }

        .btn-login {
          display: inline-block;
          background-color: #2E7D32;
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-login:hover {
          background-color: #1B5E20;
          transform: translateY(-2px);
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
          .reset-password-page {
            padding: 10px;
          }
          
          .reset-password-content {
            padding: 30px 20px;
          }
          
          .reset-password-header h2 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}