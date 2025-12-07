import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("customer"); // default role

  const handleRegister = async (e) => {
    e.preventDefault();

    const endpoint =
      role === "seller"
        ? "http://127.0.0.1:8000/api/seller/register/"
        : "http://127.0.0.1:8000/api/register/";

    try {
      const response = await axios.post(
        endpoint,
        {
          username,
          email,
          password,
          password2,
          role,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 201) {
        alert("Registered successfully!");

        // Redirect after registration
        if (role === "seller") {
          navigate("/seller/onboarding");
        } else {
          navigate("/"); // customer homepage
        }
      } else {
        alert("Error registering user");
      }
    } catch (err) {
      console.error("Error registering user:", err.response || err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error registering user"
      );
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />
      <input
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        type="password"
        placeholder="Confirm Password"
        required
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
      </select>

      <button type="submit">Register</button>
    </form>
  );
}
