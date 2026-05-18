import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaArrowLeft
} from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 30;
  };

  const validatePassword = (password) => {
    return password.length >= 4;
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
    if (name === 'password' && validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage({ type: "", text: "" });
    setErrors({});

    const { username, password, remember } = formData;
    let newErrors = {};

    // Validation
    if (!username) {
      newErrors.username = "Username is required";
    } else if (!validateUsername(username)) {
      newErrors.username = "Username must be 3-30 characters";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password
      }, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Store tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      setMessage({ 
        type: "success", 
        text: "Login successful! Redirecting..." 
      });

      // Redirect after delay
      setTimeout(() => {
        navigate("/main");
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Invalid credentials. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler — uses credential flow (one-tap / popup)
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      const res = await axios.post('http://127.0.0.1:8000/api/auth/google-login/', {
        access_token: tokenResponse.access_token,
      });

      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setMessage({ type: 'success', text: 'Signed in with Google! Redirecting...' });
      setTimeout(() => navigate('/main'), 1200);
    } catch (err) {
      console.error('Google login error:', err);
      setMessage({ type: 'error', text: 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setMessage({ type: 'error', text: 'Google sign-in was cancelled.' }),
  });

  return (
    <div className="login-page">
      {/* Back Button */}
      <Link to="/" className="back-button">
        <FaArrowLeft />
        <span>Back to Home</span>
      </Link>
      
      <div className="login-container">
        <div className="login-right">
          <div className="login-header">
            <h2>Login to Your Account</h2>
            <p>Enter your credentials to access your Ecomarket dashboard</p>
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

          <form className="login-form" onSubmit={handleSubmit}>
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
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.username && (
                <div className="error-message show">{errors.username}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="remember-forgot">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className={`btn-login ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spinning" /> : <FaSignInAlt />}
              <span>{loading ? "Logging in..." : "Login to Account"}</span>
            </button>

            {/* Divider */}
            <div className="divider">
              <span>Or continue with</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button type="button" className="btn-social btn-google" onClick={() => googleLogin()}>
                <FaGoogle />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Signup Link */}
            <div className="signup-link">
              Don't have an account? 
              <Link to="/register">Sign up now</Link>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <h4><FaInfoCircle /> Demo Credentials</h4>
              <p><strong>Username:</strong> demo_user</p>
              <p><strong>Password:</strong> demo123</p>
              <p><small>Use these credentials to test the login functionality</small></p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          background-color: #F9F7F3;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-image: url('https://images.unsplash.com/photo-1497534446932-c925b458314e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80');
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

        .login-container {
          width: 100%;
          max-width: 600px;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .login-right {
          background-color: white;
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-header h2 {
          font-size: 2.2rem;
          color: #1B5E20;
          margin-bottom: 10px;
        }

        .login-header p {
          color: #666666;
          font-size: 1.1rem;
        }

        .login-form {
          width: 100%;
          max-width: 450px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333333;
          font-size: 1rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #666666;
          font-size: 18px;
        }

        .form-control {
          width: 100%;
          padding: 16px 20px 16px 55px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
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
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666666;
          cursor: pointer;
          font-size: 18px;
        }

        .error-message {
          color: #f44336;
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .error-message.show {
          display: block;
        }

        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
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

        .forgot-password {
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .forgot-password:hover {
          color: #1B5E20;
          text-decoration: underline;
        }

        .btn-login {
          width: 100%;
          padding: 18px;
          background-color: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 25px;
        }

        .btn-login:hover:not(:disabled) {
          background-color: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-login:disabled {
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
          margin: 30px 0;
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
          margin-bottom: 30px;
        }

        .btn-social {
          flex: 1;
          padding: 15px;
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

        .signup-link {
          text-align: center;
          color: #666666;
          margin-top: 30px;
        }

        .signup-link a {
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
          margin-left: 5px;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        .demo-credentials {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #2E7D32;
          padding: 15px;
          margin-top: 30px;
          border-radius: 8px;
        }

        .demo-credentials h4 {
          color: #1B5E20;
          margin-bottom: 10px;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .demo-credentials p {
          font-size: 0.9rem;
          color: #666666;
          margin-bottom: 5px;
        }

        .alert {
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 25px;
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

        @media (max-width: 576px) {
          .login-page {
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
          
          .login-right {
            padding: 30px 20px;
          }
          
          .login-header h2 {
            font-size: 1.8rem;
          }
          
          .social-login {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}