import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("customer");
  const [shop_name, setShopName] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const endpoint =
      role === "seller"
        ? "http://127.0.0.1:8000/api/seller/register/"
        : "http://127.0.0.1:8000/api/register/";

    const payload = {
      username,
      first_name,
      last_name,
      email,
      password,
      password2,
      role,
    };

    if (role === "seller") {
      payload.shop_name = shop_name;
    }

    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 201) {
        alert("Registered successfully!");
        navigate(role === "seller" ? "/seller/onboarding" : "/");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleRegister} className="register-form">
        <h2>Register</h2>

        <div className="form-group">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>

        <div className="form-group">
          <input
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
          />
        </div>

        <div className="form-group">
          <input
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
          />
        </div>

        <div className="form-group">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
          />
        </div>

        <div className="form-group">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
        </div>

        <div className="form-group">
          <input
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            type="password"
            placeholder="Confirm Password"
            required
          />
        </div>

        {role === "seller" && (
          <div className="form-group">
            <input
              value={shop_name}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Shop Name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value !== "seller") {
                setShopName("");
              }
            }}
            required
          >
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
