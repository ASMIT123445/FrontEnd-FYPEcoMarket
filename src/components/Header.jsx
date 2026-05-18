import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaHeart, FaShoppingCart, FaChevronDown, FaUser, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { getUserFromToken, logout } from '../utils/auth';
import { cartService } from '../services/cartService';

const Header = ({ 
  cartCount 
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [currentCartCount, setCurrentCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userInfo = getUserFromToken();
    setUser(userInfo);
    setUserLoading(false);
    
    if (cartCount !== undefined) {
      setCurrentCartCount(cartCount);
    } else if (userInfo) {
      cartService.getCartCount()
        .then(count => setCurrentCartCount(count))
        .catch(() => setCurrentCartCount(0));
    }
  }, [cartCount]);

  const handleLogout = () => { logout(); };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const q = searchQuery.trim();
      if (q) navigate(`/view-all?search=${encodeURIComponent(q)}`);
      else navigate('/view-all');
    }
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/main" className="logo">
              <FaLeaf />
              <span className="logo-text">Ecomarket</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: 480, margin: '0 24px', display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 24, padding: '0 16px', border: '1px solid #e0e0e0' }}>
            <FaSearch style={{ color: '#888', fontSize: '0.85rem', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products..."
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 10px', fontSize: '0.9rem', outline: 'none', color: '#333' }}
            />
            <button
              onClick={handleSearch}
              style={{ background: '#2E7D32', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              Search
            </button>
          </div>
          
          <div className="header-right">
            <div className="nav-actions">
              <div className="nav-icon" onClick={() => navigate('/wishlist')}>
                <FaHeart />
                <span className="badge">3</span>
              </div>
              <div className="nav-icon" onClick={() => navigate('/cart')}>
                <FaShoppingCart />
                <span className="badge">{currentCartCount}</span>
              </div>
              <div className="user-menu-container">
                <div className="user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                  <div className="user-avatar">
                    {userLoading ? '...' : 
                     (user?.username ? user.username.charAt(0).toUpperCase() : 
                      user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <span className="user-name">
                    {userLoading ? 'Loading...' :
                     (user?.username || 
                      (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'))}
                  </span>
                  <FaChevronDown className={`dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`} />
                </div>
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => navigate('/profile')}>
                      <FaUser /> Profile
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/cart')}>
                      <FaShoppingCart /> My Orders
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/wishlist')}>
                      <FaHeart /> Wishlist
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout-item" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;