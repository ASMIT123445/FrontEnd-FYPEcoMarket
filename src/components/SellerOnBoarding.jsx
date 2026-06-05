import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveSection } from "../services/api/auth";
import Header from "./Header";
import TermsModal from "./TermsModal";
import { 
  FaArrowLeft,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle
} from "react-icons/fa";
import "../styles/Header.css";

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [termsModal, setTermsModal] = useState(null); // null | 'terms' | 'authenticity'
  const [answers, setAnswers] = useState({
    business_name: "",
    business_type: "",
    business_description: "",
    store_name: "",
    store_category: "",
    owner_full_name: "",
    phone_number: "",
    business_address: "",
    province: "",
    pickup_address: "",
    id_proof: null,
    business_document: null,
    authorized: false,
    payment_method: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_name: "",
    digital_wallet_number: "",
    agreed_terms: false,
    agreed_authenticity_policy: false,
  });

  const sections = [
    { id: 1, title: "Business Information" },
    { id: 2, title: "Store Details" },
    { id: 3, title: "Contact Information" },
    { id: 4, title: "Document Upload" },
    { id: 5, title: "Payment Setup" },
    { id: 6, title: "Terms & Conditions" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setAnswers({ ...answers, [name]: checked });
    } else if (type === "file") {
      setAnswers({ ...answers, [name]: files[0] });
    } else {
      setAnswers({ ...answers, [name]: value });
    }
    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSaveSection = async () => {
    const requiredFields = {
      1: ["business_name", "business_type", "business_description"],
      2: ["store_name", "store_category"],
      3: ["owner_full_name", "phone_number", "business_address", "province"],
      4: ["id_proof"],
      5: ["payment_method", "bank_account_name", "bank_account_number", "bank_name"],
      6: ["agreed_terms", "agreed_authenticity_policy"]
    };

    const missing = requiredFields[step].filter(
      (field) => !answers[field] || answers[field] === ""
    );

    if (missing.length > 0) {
      setMessage({
        type: "error",
        text: "Please fill all required fields before continuing."
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await saveSection({ step, answers });
      
      if (step === 6) {
        // Final step completed - redirect to home
        setMessage({
          type: "success",
          text: "Onboarding completed successfully! Welcome to Ecomarket!"
        });
        // Set flag for welcome message
        localStorage.setItem('justRegistered', 'true');
        setTimeout(() => {
          navigate("/main");
        }, 2000);
      } else {
        setMessage({
          type: "success",
          text: `Section ${step} saved successfully!`
        });
        setTimeout(() => {
          setStep(step + 1);
          setMessage({ type: "", text: "" });
        }, 1000);
      }
    } catch (err) {
      const status = err.response?.status;
      let errorMessage = "Something went wrong. Please try again.";
    
      if (status === 401) {
        errorMessage = "Session expired. Please login again.";
        // Don't immediately redirect, let the user see the message
        setTimeout(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/login');
        }, 2000);
      } else if (status === 403) {
        errorMessage = "Access denied. Only sellers can complete onboarding.";
      } else if (status === 400) {
        errorMessage = "Invalid data. Please check the form fields.";
      } else if (status === 404) {
        errorMessage = "Onboarding record not found. Please refresh and try again.";
      } else if (status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setMessage({ type: "", text: "" });
  };

  const totalSteps = 6;
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="onboarding-page">
      {/* Terms / Authenticity modal */}
      {termsModal && (
        <TermsModal type={termsModal} onClose={() => setTermsModal(null)} />
      )}

      {/* Header */}
      <Header 
        cartCount={2}
      />

      {/* Page banner — matches SellerDashboard / Profile style */}
      <div className="onboarding-page-banner">
        <div className="onboarding-banner-inner">
          <h1>🌿 Seller Onboarding</h1>
          <p>Complete your seller profile to start selling on Ecomarket</p>
        </div>
      </div>

      <div className="onboarding-container">
        <div className="onboarding-content">
          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="progress-steps">
              {sections.map((section, index) => (
                <div 
                  key={section.id} 
                  className={`progress-step ${step >= section.id ? 'completed' : ''} ${step === section.id ? 'active' : ''}`}
                >
                  <div className="step-number">
                    {step > section.id ? <FaCheckCircle /> : section.id}
                  </div>
                  <span className="step-title">{section.title}</span>
                </div>
              ))}
            </div>
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

          {/* Form Sections */}
          <div className="form-container">
            {/* SECTION 1: Business Information */}
            {step === 1 && (
              <div className="form-section">
                <div className="section-header">
                  <h2>Business Information</h2>
                  <p>Tell us about your business</p>
                </div>

                <div className="form-group">
                  <label htmlFor="business_name">Business Name *</label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    className="form-control"
                    placeholder="Enter your business name"
                    value={answers.business_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business_type">Type of Business *</label>
                  <select
                    id="business_type"
                    name="business_type"
                    className="form-control"
                    value={answers.business_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="business_description">Business Description *</label>
                  <textarea
                    id="business_description"
                    name="business_description"
                    className="form-control"
                    placeholder="Describe your business and what you sell"
                    rows="4"
                    value={answers.business_description}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: Store Details */}
            {step === 2 && (
              <div className="form-section">
                <div className="section-header">
                  <h2>Store Details</h2>
                  <p>Set up your online store</p>
                </div>

                <div className="form-group">
                  <label htmlFor="store_name">Store Name *</label>
                  <input
                    type="text"
                    id="store_name"
                    name="store_name"
                    className="form-control"
                    placeholder="Enter your store name"
                    value={answers.store_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="store_category">Store Category *</label>
                  <select
                    id="store_category"
                    name="store_category"
                    className="form-control"
                    value={answers.store_category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select store category</option>
                    <option value="eco-friendly">Eco-Friendly Products</option>
                    <option value="organic-food">Organic Food</option>
                    <option value="sustainable-fashion">Sustainable Fashion</option>
                    <option value="home-garden">Home & Garden</option>
                    <option value="beauty-personal-care">Beauty & Personal Care</option>
                    <option value="electronics">Electronics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* SECTION 3: Contact Information */}
            {step === 3 && (
              <div className="form-section">
                <div className="section-header">
                  <h2>Contact Information</h2>
                  <p>Provide your contact details</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="owner_full_name">Owner Full Name *</label>
                    <input
                      type="text"
                      id="owner_full_name"
                      name="owner_full_name"
                      className="form-control"
                      placeholder="Enter full name"
                      value={answers.owner_full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={answers.phone_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="business_address">Business Address *</label>
                  <textarea
                    id="business_address"
                    name="business_address"
                    className="form-control"
                    placeholder="Enter your business address"
                    rows="3"
                    value={answers.business_address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="province">Province *</label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    className="form-control"
                    placeholder="Enter province"
                    value={answers.province}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pickup_address">Pickup Address (Optional)</label>
                  <textarea
                    id="pickup_address"
                    name="pickup_address"
                    className="form-control"
                    placeholder="Enter pickup address if different from business address"
                    rows="3"
                    value={answers.pickup_address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* SECTION 4: Document Upload */}
            {step === 4 && (
              <div className="form-section">
                <div className="section-header">
                  <h2>Document Upload</h2>
                  <p>Upload required documents for verification</p>
                </div>

                <div className="form-group">
                  <label htmlFor="id_proof">ID Proof *</label>
                  <input
                    type="file"
                    id="id_proof"
                    name="id_proof"
                    className="form-control"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleChange}
                    required
                  />
                  <small className="help-text">Accepted formats: JPG, PNG, PDF (Max 5MB)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="business_document">Business Document (Optional)</label>
                  <input
                    type="file"
                    id="business_document"
                    name="business_document"
                    className="form-control"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleChange}
                  />
                  <small className="help-text">Business license, registration certificate, etc.</small>
                </div>
              </div>
            )}

            {/* SECTION 5: Payment Setup */}
            {step === 5 && (
              <div className="form-section">
                <div className="section-header">
                  <h2>Payment Setup</h2>
                  <p>Configure your payment details</p>
                </div>

                <div className="form-group">
                  <label htmlFor="payment_method">Payment Method *</label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    className="form-control"
                    value={answers.payment_method}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="digital_wallet">Digital Wallet</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bank_account_name">Bank Account Name *</label>
                    <input
                      type="text"
                      id="bank_account_name"
                      name="bank_account_name"
                      className="form-control"
                      placeholder="Account holder name"
                      value={answers.bank_account_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bank_account_number">Bank Account Number *</label>
                    <input
                      type="text"
                      id="bank_account_number"
                      name="bank_account_number"
                      className="form-control"
                      placeholder="Account number"
                      value={answers.bank_account_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bank_name">Bank Name *</label>
                  <input
                    type="text"
                    id="bank_name"
                    name="bank_name"
                    className="form-control"
                    placeholder="Enter bank name"
                    value={answers.bank_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="digital_wallet_number">Digital Wallet Number (Optional)</label>
                  <input
                    type="text"
                    id="digital_wallet_number"
                    name="digital_wallet_number"
                    className="form-control"
                    placeholder="Digital wallet number"
                    value={answers.digital_wallet_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* SECTION 6: Terms & Conditions */}
            {step === 6 && (
              <div className="form-section">
                <div className="section-header">
                  <h2>Terms & Conditions</h2>
                  <p>Review and accept our terms</p>
                </div>

                <div className="terms-container">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="agreed_terms"
                      name="agreed_terms"
                      checked={answers.agreed_terms}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="agreed_terms">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="terms-link-btn"
                        onClick={() => setTermsModal('terms')}
                      >
                        Terms &amp; Conditions
                      </button>{' '}*
                    </label>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="agreed_authenticity_policy"
                      name="agreed_authenticity_policy"
                      checked={answers.agreed_authenticity_policy}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="agreed_authenticity_policy">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="terms-link-btn"
                        onClick={() => setTermsModal('authenticity')}
                      >
                        Authenticity Policy
                      </button>{' '}*
                    </label>
                  </div>
                </div>

                <div className="completion-info">
                  <FaInfoCircle />
                  <p>By completing this onboarding, you'll be able to start selling on Ecomarket immediately!</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {step > 1 && (
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  <FaArrowLeft />
                  <span>Previous</span>
                </button>
              )}
              
              <button 
                type="button" 
                className={`btn-primary ${loading ? 'loading' : ''}`}
                onClick={handleSaveSection}
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinning" /> : (step === 6 ? <FaCheckCircle /> : <FaArrowRight />)}
                <span>
                  {loading 
                    ? (step === 6 ? "Completing..." : "Saving...") 
                    : (step === 6 ? "Complete Onboarding" : "Next")
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .onboarding-page {
          background-color: #f5f6fa;
          min-height: 100vh;
        }

        .onboarding-page-banner {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%);
          padding: 28px 0 32px;
        }

        .onboarding-banner-inner {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
        }

        .onboarding-banner-inner h1 {
          margin: 0 0 6px;
          font-size: 1.9rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.3px;
        }

        .onboarding-banner-inner p {
          margin: 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .onboarding-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 28px 20px 48px;
        }

        .progress-section {
          margin-bottom: 40px;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 30px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-steps {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.3s;
        }

        .step-number {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          transition: all 0.3s;
          background-color: #f0f0f0;
          color: #999;
        }

        .progress-step.active .step-number {
          background-color: #2E7D32;
          color: white;
          transform: scale(1.1);
        }

        .progress-step.completed .step-number {
          background-color: #4CAF50;
          color: white;
        }

        .step-title {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .progress-step.active .step-title {
          color: #2E7D32;
          font-weight: 600;
        }

        .progress-step.completed .step-title {
          color: #4CAF50;
          font-weight: 600;
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

        .form-container {
          margin-top: 30px;
        }

        .form-section {
          margin-bottom: 30px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-header h2 {
          font-size: 1.8rem;
          color: #1B5E20;
          margin-bottom: 8px;
        }

        .section-header p {
          color: #666666;
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333333;
          font-size: 0.95rem;
        }

        .form-control {
          width: 100%;
          padding: 14px 20px;
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

        textarea.form-control {
          resize: vertical;
          min-height: 100px;
          padding-top: 14px;
        }

        select.form-control {
          cursor: pointer;
        }

        input[type="file"].form-control {
          padding: 10px;
          background-color: white;
          cursor: pointer;
        }

        input[type="file"].form-control::-webkit-file-upload-button {
          background-color: #2E7D32;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          margin-right: 10px;
          cursor: pointer;
        }

        .help-text {
          font-size: 0.85rem;
          color: #888;
          margin-top: 5px;
        }

        .terms-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: #2E7D32;
          font-weight: 700;
          font-size: inherit;
          cursor: pointer;
          text-decoration: underline;
          font-family: inherit;
        }
        .terms-link-btn:hover { color: #1B5E20; }

        .terms-container {          background-color: #f8f9fa;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
        }

        .checkbox-group:last-child {
          margin-bottom: 0;
        }

        .checkbox-group input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #2E7D32;
          margin-top: 2px;
        }

        .checkbox-group label {
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .checkbox-group a {
          color: #2E7D32;
          text-decoration: none;
          font-weight: 600;
        }

        .checkbox-group a:hover {
          text-decoration: underline;
        }

        .completion-info {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: rgba(76, 175, 80, 0.1);
          padding: 15px;
          border-radius: 10px;
          border-left: 4px solid #4CAF50;
          margin-top: 25px;
        }

        .completion-info svg {
          color: #2E7D32;
          font-size: 20px;
        }

        .completion-info p {
          margin: 0;
          color: #1B5E20;
          font-weight: 500;
        }

        .form-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #f0f0f0;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background-color: transparent;
          color: #2E7D32;
          border: 2px solid #2E7D32;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #2E7D32;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background-color: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-left: auto;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-primary:disabled {
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

        @media (max-width: 768px) {
          .onboarding-banner-inner h1 {
            font-size: 1.5rem;
          }

          .onboarding-container {
            padding: 20px 12px 40px;
          }

          .onboarding-content {
            padding: 25px 20px;
          }

          .progress-steps {
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }

          .step-number {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .step-title {
            font-size: 0.7rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }

          .form-navigation {
            flex-direction: column;
            gap: 15px;
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
            margin-left: 0;
          }

          .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .progress-steps {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}