import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import { getUserFromToken} from "../utils/auth";
import { useEffect,useState } from "react";



export default function LandingPage() {
  const [isloggedIn, setIsLoggedIn] = useState(false)
  useEffect(()=>{
    if(getUserFromToken()){
      setIsLoggedIn(true)
    }
  },[])
  const toggleMenu = () => {
    document.querySelector(".nav-links").classList.toggle("active");
  };

  return (
    <>
      {/* Header */}
      <header>
        <div className="container">
          <nav className="navbar">
            <Link to="/" className="logo">
              <i className="fas fa-leaf logo-icon"></i>
              <span className="logo-text">Ecomarket</span>
            </Link>

            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#categories">Categories</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#join">Join Us</a></li>
            </ul>

        

           {!isloggedIn ?  <div className="nav-actions">
              <Link to="/login" className="btn btn-login">Login</Link>
              <Link to="/register" className="btn btn-signup">Sign Up</Link>
            </div>:
             <div className="nav-actions">
              <Link to="/main" className="btn btn-login">Go to dashboard</Link>
            </div>}


            <div className="mobile-toggle" onClick={toggleMenu}>
              <i className="fas fa-bars"></i>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Shop Sustainable, Live Better</h1>
              <p>
                Discover eco-friendly products that help protect our planet.
                EcoMarket connects conscious consumers with sustainable sellers.
              </p>
              <Link to="/register" className="btn btn-hero">
                Start Shopping <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"
                alt="Eco Products"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features
      <section className="features" id="features">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Ecomarket?</h2>
            <p>Sustainability-driven features for a greener future.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-leaf feature-icon"></i>
              <h3>Eco-Certified Products</h3>
              <p>Verified sustainable products you can trust.</p>
            </div>

            <div className="feature-card">
              <i className="fas fa-recycle feature-icon"></i>
              <h3>Zero-Waste Focus</h3>
              <p>Minimal packaging & circular economy support.</p>
            </div>

            <div className="feature-card">
              <i className="fas fa-truck feature-icon"></i>
              <h3>Carbon-Neutral Shipping</h3>
              <p>Eco-friendly delivery with reduced emissions.</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* What is Ecomarket Section */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>What is Ecomarket?</h2>
          </div>
          <div className="about-content">
            <p className="about-text">
              Ecomarket is a specialized online marketplace dedicated to promoting sustainable living in Nepal. 
              We bridge the gap between eco-conscious consumers and verified sellers offering genuine eco-friendly products. 
              Unlike traditional marketplaces, every seller and product on Ecomarket undergoes a rigorous verification 
              process by our admin team to ensure authenticity and environmental compliance.
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Verified Sellers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">7+</div>
                <div className="stat-label">Eco Categories</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">Rs</div>
                <div className="stat-label">Local Currency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-title">
            <h2>How Ecomarket Works</h2>
            <p>Your journey to sustainable shopping in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              
              <i className="fas fa-users step-icon"></i>
              <h3>Register Your Account</h3>
              <p>Sign up as a customer to shop or as a seller to list your eco-friendly products</p>
            </div>
            <div className="step-card">
              
              <i className="fas fa-shield-alt step-icon"></i>
              <h3>Verification Process</h3>
              <p>Sellers submit business documents and product details for admin verification</p>
            </div>
            <div className="step-card">
            
              <i className="fas fa-store step-icon"></i>
              <h3>Browse & Shop</h3>
              <p>Explore verified eco-friendly products across multiple sustainable categories</p>
            </div>
            <div className="step-card">
              
              <i className="fas fa-handshake step-icon"></i>
              <h3>Secure Transactions</h3>
              <p>Complete your purchase with confidence knowing all sellers are verified</p>
            </div>
          </div>
        </div>
      </section>

    
      {/* Eco Categories Section */}
      <section className="eco-categories-section" id="categories">
        <div className="container">
          <div className="section-title">
            <h2>Our Eco Categories</h2>
            <p>Explore our 7 carefully curated sustainable product categories</p>
          </div>
          <div className="eco-categories-grid">
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-recycle"></i></div>
              <h3>Recycled Items</h3>
              <p>Products crafted from recycled and upcycled materials</p>
            </div>
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-seedling"></i></div>
              <h3>Organic Products</h3>
              <p>100% organic and naturally sourced goods</p>
            </div>
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-solar-panel"></i></div>
              <h3>Energy-Efficient</h3>
              <p>Products designed to reduce energy consumption</p>
            </div>
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-home"></i></div>
              <h3>Reusable Household</h3>
              <p>Durable, reusable alternatives for everyday home use</p>
            </div>
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-paint-brush"></i></div>
              <h3>Handmade Eco-Crafts</h3>
              <p>Artisan-made products with sustainable materials</p>
            </div>
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-tshirt"></i></div>
              <h3>Sustainable Fashion</h3>
              <p>Ethical clothing and accessories for conscious dressing</p>
            </div>
            <div className="eco-category-card">
              <div className="eco-cat-icon"><i className="fas fa-leaf"></i></div>
              <h3>Eco Home & Garden</h3>
              <p>Green solutions for your home and outdoor spaces</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="join">
        <div className="container">
          <div className="cta-content">
            <h2>Join the Sustainable Shopping Movement</h2>
            <p>Sign up today and make a positive impact.</p>
            <Link to="/register" className="btn btn-cta">
              Create Account <i className="fas fa-user-plus"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact">
        <div className="container">
          <p className="copyright">
            © 2025 EcoMarket | Sustainable Shopping Platform
          </p>
        </div>
      </footer>
    </>
  );
}
