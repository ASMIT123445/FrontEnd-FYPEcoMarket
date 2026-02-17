import { useNavigate } from "react-router-dom";
import { 
  FaLeaf, 
  FaRecycle, 
  FaSeedling, 
  FaHeart, 
  FaShoppingCart, 
  FaArrowRight, 
  FaCheckCircle,
  FaShieldAlt,
  FaStore,
  FaGlobe
} from "react-icons/fa";
import "../styles/LandingHome.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to Ecomarket</h1>
            <p className="hero-subtitle">Nepal's First Verified Eco-Friendly Marketplace</p>
            <p className="hero-description">
              Connecting conscious consumers with verified sustainable sellers. Every product on Ecomarket 
              is carefully reviewed to ensure it meets our environmental standards. Shop with confidence, 
              knowing your choices support a greener Nepal.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/products')}>
                <FaShoppingCart />
                <span>Start Shopping</span>
              </button>
              {/* <button className="btn-secondary" onClick={() => navigate('/register')}>
                <FaStore />
                <span>Become a Seller</span>
              </button> */}
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Eco-friendly products"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Ecomarket?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Admin Verified Sellers</h3>
              <p>Every seller undergoes thorough verification with business documents and ID proof before listing products</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaCheckCircle />
              </div>
              <h3>Authentic Eco Products</h3>
              <p>All products are reviewed to ensure they meet genuine environmental and sustainability standards</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaRecycle />
              </div>
              <h3>7 Eco Categories</h3>
              <p>From recycled items to organic products, energy-efficient goods to sustainable fashion</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaGlobe />
              </div>
              <h3>Support Local Economy</h3>
              <p>Connect with Nepali sellers and contribute to building a sustainable local marketplace</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaHeart />
              </div>
              <h3>Wishlist & Cart</h3>
              <p>Save your favorite products and manage your shopping with our easy-to-use cart system</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaSeedling />
              </div>
              <h3>Environmental Impact</h3>
              <p>Track eco-ratings and make informed decisions that contribute to a greener planet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="categories-preview">
        <div className="container">
          <h2 className="section-title">Explore Our Eco Categories</h2>
          <p className="section-subtitle">
            Browse through our carefully created categories of sustainable products
          </p>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigate('/products?category=recycled_items')}>
              <FaRecycle className="category-icon" />
              <h3>Recycled Items</h3>
              <p>Products made from recycled materials</p>
            </div>
            <div className="category-card" onClick={() => navigate('/products?category=organic_products')}>
              <FaSeedling className="category-icon" />
              <h3>Organic Products</h3>
              <p>100% organic and natural goods</p>
            </div>
            <div className="category-card" onClick={() => navigate('/products?category=reusable_household')}>
              <FaLeaf className="category-icon" />
              <h3>Reusable Household</h3>
              <p>Sustainable home essentials</p>
            </div>
            <div className="category-card" onClick={() => navigate('/products')}>
              <FaArrowRight className="category-icon" />
              <h3>View All Categories</h3>
              <p>Explore all 7 eco categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="sellers-section">
        <div className="container">
          <div className="sellers-content">
            <div className="sellers-text">
              <h2>Are You an Eco-Friendly Seller?</h2>
              <p>
                Join Ecomarket and reach thousands of  consumers looking for sustainable products. 
                Our platform provides you with the tools to showcase your eco-friendly offerings to a targeted audience.
              </p>
              <ul className="sellers-benefits">
                <li><FaCheckCircle /> Access to verified eco-conscious customer base</li>
                <li><FaCheckCircle /> Easy product listing and management</li>
                <li><FaCheckCircle /> Admin support throughout the verification process</li>
                <li><FaCheckCircle /> Build trust through our verification badge</li>
              </ul>
              <button className="btn-seller" onClick={() => navigate('/register')}>
               
                Register as Seller
              </button>
            </div>
            <div className="sellers-image">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Become a seller"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Shop Sustainably?</h2>
            <p>Join the movement towards a greener Nepal. Start exploring verified eco-friendly products today.</p>
            <button className="btn-cta" onClick={() => navigate('/products')}>
              Start Shopping Now
              <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2026 Ecomarket. Nepal's Trusted Eco-Friendly Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
