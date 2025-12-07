import { useState } from "react";
import axios from "axios";

export default function SellerOnboarding() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    // Section 1
    business_name: "",
    business_type: "",
    business_description: "",
    // Section 2
    store_name: "",
    store_category: "",
    // Section 3
    owner_full_name: "",
    phone_number: "",
    business_address: "",
    province: "",
    pickup_address: "",
    // Section 4
    id_proof: null,
    business_document: null,
    authorized: false,
    // Section 5
    payment_method: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_name: "",
    digital_wallet_number: "",
    // Section 6
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

  const saveSection = async () => {
    const formData = new FormData();
    for (const key in answers) {
      if (answers[key] !== null) formData.append(key, answers[key]);
    }
  
    try {
      const token = localStorage.getItem("token"); // JWT stored on login
  
      await axios.post(
        `http://127.0.0.1:8000/api/auth/seller/onboarding/${step}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // <-- required
          },
        }
      );
  
      alert(`Section ${step} saved!`);
      setStep(step + 1);
    } catch (err) {
      console.log(err.response?.data);
      alert("Error saving section");
    }
  };
  
  

  const handlePrevious = () => setStep(step - 1);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Seller Onboarding</h1>
  
      {/* SECTION 1 */}
      {step === 1 && (
        <div>
          <label>Business Name</label>
          <input name="business_name" onChange={handleChange} />
  
          <label>Type of Business</label>
          <input name="business_type" onChange={handleChange} />
  
          <label>Business Description</label>
          <textarea name="business_description" onChange={handleChange} />
  
          <button onClick={saveSection}>Next</button>
        </div>
      )}
  
      {/* SECTION 2 */}
      {step === 2 && (
        <div>
          <label>Store Name</label>
          <input name="store_name" onChange={handleChange} />
  
          <label>Store Category</label>
          <input name="store_category" onChange={handleChange} />
  
          <button onClick={handlePrevious}>Back</button>
          <button onClick={saveSection}>Next</button>
        </div>
      )}
  
      {/* SE