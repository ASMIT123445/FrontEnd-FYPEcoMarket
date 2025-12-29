import { useState } from "react";
import { saveSection } from "../services/api/auth";

export default function SellerOnboarding() {
  const [step, setStep] = useState(1);
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setAnswers({ ...answers, [name]: checked });
    } else if (type === "file") {
      setAnswers({ ...answers, [name]: files[0] });
    } else {
      setAnswers({ ...answers, [name]: value });
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
      alert("Please fill all required fields before continuing.");
      return;
    }

    try {
      await saveSection({ step, answers });
      alert(`Section ${step} saved!`);
      setStep(step + 1);
    } catch (err) {
      console.log("Error: ", err);
      alert("Error saving section");
    }
  };

  const handlePrevious = () => setStep(step - 1);

  const totalSteps = 6;
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="onboarding-page">
      <form className="onboarding-form">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
        </div>

        <h1 className="form-heading">Seller Onboarding</h1>

        {/* SECTION 1 */}
        {step === 1 && (
          <div className="form-section">
            <label>Business Name</label>
            <input className="form-input" name="business_name" onChange={handleChange} />

            <label>Type of Business</label>
            <input className="form-input" name="business_type" onChange={handleChange} />

            <label>Business Description</label>
            <textarea className="form-textarea" name="business_description" onChange={handleChange} />

            <div className="form-buttons">
              <button type="button" className="form-button" onClick={handleSaveSection}>Next</button>
            </div>
          </div>
        )}

        {/* SECTION 2 */}
        {step === 2 && (
          <div className="form-section">
            <label>Store Name</label>
            <input className="form-input" name="store_name" onChange={handleChange} />

            <label>Store Category</label>
            <input className="form-input" name="store_category" onChange={handleChange} />

            <div className="form-buttons">
              <button type="button" className="form-button" onClick={handlePrevious}>Back</button>
              <button type="button" className="form-button" onClick={handleSaveSection}>Next</button>
            </div>
          </div>
        )}

        {/* SECTION 3 */}
        {step === 3 && (
          <div className="form-section">
            <label>Owner Full Name</label>
            <input className="form-input" name="owner_full_name" onChange={handleChange} />

            <label>Phone Number</label>
            <input className="form-input" name="phone_number" onChange={handleChange} />

            <label>Business Address</label>
            <textarea className="form-textarea" name="business_address" onChange={handleChange} />

            <label>Province</label>
            <input className="form-input" name="province" onChange={handleChange} />

            <label>Pickup Address (optional)</label>
            <textarea className="form-textarea" name="pickup_address" onChange={handleChange} />

            <div className="form-buttons">
              <button type="button" className="form-button" onClick={handlePrevious}>Back</button>
              <button type="button" className="form-button" onClick={handleSaveSection}>Next</button>
            </div>
          </div>
        )}

        {/* SECTION 4 */}
        {step === 4 && (
          <div className="form-section">
            <label>ID Proof</label>
            <input className="form-input" type="file" name="id_proof" onChange={handleChange} />

            <label>Business Document (optional)</label>
            <input className="form-input" type="file" name="business_document" onChange={handleChange} />

            <div className="form-buttons">
              <button type="button" className="form-button" onClick={handlePrevious}>Back</button>
              <button type="button" className="form-button" onClick={handleSaveSection}>Next</button>
            </div>
          </div>
        )}

        {/* SECTION 5 */}
        {step === 5 && (
          <div className="form-section">
            <label>Payment Method</label>
            <input className="form-input" name="payment_method" onChange={handleChange} />

            <label>Bank Account Name</label>
            <input className="form-input" name="bank_account_name" onChange={handleChange} />

            <label>Bank Account Number</label>
            <input className="form-input" name="bank_account_number" onChange={handleChange} />

            <label>Bank Name</label>
            <input className="form-input" name="bank_name" onChange={handleChange} />

            <label>Digital Wallet Number (optional)</label>
            <input className="form-input" name="digital_wallet_number" onChange={handleChange} />

            <div className="form-buttons">
              <button type="button" className="form-button" onClick={handlePrevious}>Back</button>
              <button type="button" className="form-button" onClick={handleSaveSection}>Next</button>
            </div>
          </div>
        )}

        {/* SECTION 6 */}
        {step === 6 && (
          <div className="form-section">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="agreed_terms"
                onChange={(e) =>
                  handleChange({ target: { name: "agreed_terms", value: e.target.checked } })
                }
              />
              I agree to the Terms & Conditions
            </label>

            <label className="form-checkbox">
              <input
                type="checkbox"
                name="agreed_authenticity_policy"
                onChange={(e) =>
                  handleChange({
                    target: { name: "agreed_authenticity_policy", value: e.target.checked },
                  })
                }
              />
              I agree to the Authenticity Policy
            </label>

            <div className="form-buttons">
              <button type="button" className="form-button" onClick={handlePrevious}>Back</button>
              <button type="button" className="form-button" onClick={handleSaveSection}>Finish</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
