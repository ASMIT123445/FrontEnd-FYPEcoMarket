import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      {/* Top Navbar */}
      <div className="navbar">
        <Link to="/login" className="nav-btn">Login</Link>
        <Link to="/register" className="nav-btn">Register</Link>
      </div>

      {/* Main Content */}
      <div className="home-content">
        <h1>Welcome to EcoMarket 🌱</h1>
        <p>Your eco-friendly marketplace</p>
      </div>
    </div>
  );
}
