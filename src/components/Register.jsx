import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserPlus, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaEnvelope,
  FaStore,
  FaUsers,
  FaArrowLeft
} from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { useGoogleLogin } from '@react-oauth/google';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    role: "customer",
    address: "",
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 30;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 4;
  };

  const validateName = (name) => {
    return name.length >= 2 && name.length <= 50;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Real-time validation
    if (name === 'username' && validateUsername(value)) {
      setErrors(prev => ({ ...prev, username: "" }));
    }
    if (name === 'email' && validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    if (name === 'password' && validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
    if (name === 'password2' && value === formData.password) {
      setErrors(prev => ({ ...prev, password2: "" }));
    }
    if (name === 'first_name' && validateName(value)) {
      setErrors(prev => ({ ...prev, first_name: "" }));
    }
    if (name === 'last_name' && validateName(value)) {
      setErrors(prev => ({ ...prev, last_name: "" }));
    }

    // Clear address when switching roles (optional - can keep address for both)
    // if (name === 'role') {
    //   setFormData(prev => ({ ...prev, address: "" }));
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage({ type: "", text: "" });
    setErrors({});

    const { username, first_name, last_name, email, password, password2, role, address, remember } = formData;
    let newErrors = {};

    // Validation
    if (!username) {
      newErrors.username = "Username is required";
    } else if (!validateUsername(username)) {
      newErrors.username = "Username must be 3-30 characters";
    }

    if (!first_name) {
      newErrors.first_name = "First name is required";
    } else if (!validateName(first_name)) {
      newErrors.first_name = "First name must be 2-50 characters";
    }

    if (!last_name) {
      newErrors.last_name = "Last name is required";
    } else if (!validateName(last_name)) {
      newErrors.last_name = "Last name must be 2-50 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

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

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    // Check if remember me is checked (mandatory)
    if (!remember) {
      setMessage({ 
        type: "error", 
        text: "Please agree to terms and conditions" 
      });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const endpoint = role === "seller" 
        ? `${API_BASE_URL}/api/seller/register/`
        : `${API_BASE_URL}/api/register/`;

      const payload = {
        username,
        first_name,
        last_name,
        email,
        password,
        password2,
        role,
        address
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 201) {
        if (response.data.verification_required) {
          // Email verification required
          setMessage({ 
            type: "success", 
            text: "Registration initiated! Please check your email for the verification code." 
          });
          // Navigate to verification page with email
          setTimeout(() => {
            navigate("/verify-email", { state: { email: response.data.email } });
          }, 2000);
        } else {
          // Direct registration (fallback)
          if (response.data.access && response.data.refresh) {
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
          }
          
          setMessage({ 
            type: "success", 
            text: "Registration successful! Redirecting..." 
          });

          setTimeout(() => {
            if (role === "seller") {
              navigate("/seller/onboarding");
            } else {
              localStorage.setItem('justRegistered', 'true');
              navigate("/main");
            }
          }, 1500);
        }
      }

    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data) {
        // Handle different error response formats
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.email) {
          errorMessage = `Email: ${err.response.data.email[0]}`;
        } else if (err.response.data.username) {
          errorMessage = `Username: ${err.response.data.username[0]}`;
        } else if (err.response.data.password) {
          errorMessage = `Password: ${err.response.data.password[0]}`;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setMessage({ 
        type: "error", 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/google-login/`, {
        access_token: tokenResponse.access_token,
      });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setMessage({ type: 'success', text: 'Signed up with Google! Redirecting...' });
      setTimeout(() => navigate('/main'), 1200);
    } catch (err) {
      console.error('Google sign-up error:', err);
      setMessage({ type: 'error', text: 'Google sign-up failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setMessage({ type: 'error', text: 'Google sign-up was cancelled.' }),
  });

  return (
    <div className="register-page">
      {/* Back Button */}
      <Link to="/" className="back-button">
        <FaArrowLeft />
        <span>Back to Home</span>
      </Link>
      
      <div className="register-container">
        <div className="register-right">
          <div className="register-header">
            <h2>Create Your Account</h2>
            <p>Join Ecomarket and start your sustainable shopping journey</p>
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

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="form-group">
              <label>Account Type</label>
              <div className="role-selection">
                <div className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    id="customer"
                    name="role"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="customer">
                    <FaUsers />
                    <span>Customer</span>
                    <small>Shop eco-friendly products</small>
                  </label>
                </div>
                <div className={`role-option ${formData.role === 'seller' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    id="seller"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="seller">
                    <FaStore />
                    <span>Seller</span>
                    <small>Sell sustainable products</small>
                  </label>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className={`form-control ${errors.first_name ? 'error' : ''}`}
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {errors.first_name && (
                  <div className="error-message show">{errors.first_name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className={`form-control ${errors.last_name ? 'error' : ''}`}
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {errors.last_name && (
                  <div className="error-message show">{errors.last_name}</div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-control ${errors.username ? 'error' : ''}`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.username && (
                <div className="error-message show">{errors.username}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.email && (
                <div className="error-message show">{errors.email}</div>
              )}
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <div className="input-with-icon">
                <FaStore className="input-icon" />
                <textarea
                  id="address"
                  name="address"
                  className={`form-control ${errors.address ? 'error' : ''}`}
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  style={{
                    paddingLeft: '45px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              {errors.address && (
                <div className="error-message show">{errors.address}</div>
              )}
            </div>

            {/* Password Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="Create password"
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
                  <div className="error-message show">{errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password2">Confirm Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword2 ? "text" : "password"}
                    id="password2"
                    name="password2"
                    className={`form-control ${errors.password2 ? 'error' : ''}`}
                    placeholder="Confirm password"
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
                  <div className="error-message show">{errors.password2}</div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="remember-forgot">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                />
                <label htmlFor="remember">I agree to Terms & Conditions *</label>
              </div>
            </div>

            {/* Register Button */}
            <button 
              type="submit" 
              className={`btn-register ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spinning" /> : <FaUserPlus />}
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
            </button>

            {/* Divider */}
            <div className="divider">
              <span>Or continue with</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button type="button" className="btn-social btn-google" onClick={() => googleSignUp()}>
                <FaGoogle />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Login Link */}
            <div className="login-link">
              Already have an account? 
              <Link to="/login">Sign in now</Link>
            </div>

            {/* Info */}
            <div className="demo-credentials">
              <h4><FaInfoCircle /> Registration Info</h4>
              <p>• Email verification required for all accounts</p>
              <p>• Sellers will complete onboarding after registration</p>
              <p>• Use the same email multiple times for testing</p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .register-page {
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
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 30px;
          left: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 12px 20px;
          border-radius: 25px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .back-button:hover {
          background-color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          color: #1B5E20;
        }

        .back-button svg {
          font-size: 16px;
        }

        .register-container {
          width: 100%;
          max-width: 700px;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .register-right {
          background-color: white;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-header h2 {
          font-size: 2.2rem;
          color: #1B5E20;
          margin-bottom: 10px;
        }

        .register-header p {
          color: #666666;
          font-size: 1.1rem;
        }

        .register-form {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333333;
          font-size: 0.95rem;
        }

        .role-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .role-option {
          position: relative;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .role-option.active {
          border-color: #2E7D32;
          background-color: rgba(46, 125, 50, 0.05);
        }

        .role-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .role-option label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .role-option label svg {
          font-size: 24px;
          color: #2E7D32;
        }

        .role-option label span {
          font-weight: 600;
          color: #333;
        }

        .role-option label small {
          color: #666;
          font-size: 0.8rem;
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

        .error-message.show {
          display: block;
        }

        .remember-forgot {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 25px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remember-me input {
          width: 18px;
          height: 18px;
          accent-color: #2E7D32;
        }

        .btn-register {
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
          margin-bottom: 25px;
        }

        .btn-register:hover:not(:disabled) {
          background-color: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-register:disabled {
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

        .divider {
          text-align: center;
          position: relative;
          margin: 25px 0;
          color: #666666;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #e0e0e0;
        }

        .divider span {
          background-color: white;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .social-login {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }

        .btn-social {
          flex: 1;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background-color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-social:hover {
          border-color: #2E7D32;
          transform: translateY(-2px);
        }

        .btn-google {
          color: #DB4437;
        }

        .login-link {
          text-align: center;
          color: #666666;
          margin-top: 25px;
        }

        .login-link a {
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
          margin-left: 5px;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        .demo-credentials {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #2E7D32;
          padding: 15px;
          margin-top: 25px;
          border-radius: 8px;
        }

        .demo-credentials h4 {
          color: #1B5E20;
          margin-bottom: 10px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .demo-credentials p {
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
          .register-page {
            padding: 10px;
          }
          
          .back-button {
            top: 20px;
            left: 20px;
            padding: 10px 16px;
            font-size: 14px;
          }
          
          .back-button span {
            display: none;
          }
          
          .register-right {
            padding: 30px 20px;
          }
          
          .register-header h2 {
            font-size: 1.8rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .role-selection {
            grid-template-columns: 1fr;
          }
          
          .social-login {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}