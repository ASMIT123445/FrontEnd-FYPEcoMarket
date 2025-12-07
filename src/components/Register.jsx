import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("customer"); // customer or seller

  const handleRegister = async (e) => {
    e.preventDefault();
    
      try {
        await axios.post("http://127.0.0.1:8000/api/register/", {
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
        });
    
        alert("Registered successfully!");
    
        // Redirect seller to onboarding
        if (role === "seller") {
          navigate("/seller/onboarding");
        } else {
          navigate("/"); // redirect customer to homepage or wherever
        }
      } catch (err) {
        alert("Error registering user");
      }
    };
    
  return (
    <form onSubmit={handleRegister}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />

      <input
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        type="password"
        placeholder="Confirm Password"
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
      </select>

      <button type="submit">Register</button>
    </form>
  );
}
