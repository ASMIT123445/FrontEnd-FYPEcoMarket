import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaHeart, FaShoppingCart, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
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

  useEffect(() => {
    const userInfo = getUserFromToken();
    setUser(userInfo);
    setUserLoading(false);
    
    // Use passed cartCount or get from API
    if (cartCount !== undefined) {
      setCurrentCartCount(cartCount);
    } else if (userInfo) {
      // Get cart count from API
      cartService.getCartCount()
        .then(count => setCurrentCartCount(count))
        .catch(error => {
          console.error('Error getting cart count:', error);
          setCurrentCartCount(0);
        });
    }
  }, [cartCount]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/products" className="logo">
              <FaLeaf />
              <span className="logo-text">Ecomarket</span>
            </Link>
          </div>
          
          <div className="header-right">
            <div className="nav-actions">
              <div className="nav-icon">
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
                                            <FaUser/>
                                            Profile
                                        </div>
                                        <div className="dropdown-item" onClick={() => navigate('/cart')}>
                                            <FaShoppingCart/>
                                            My Orders
                                            
                                        </div>
                                        <div className="dropdown-item" onClick={() => navigate('/wishlist')}>
                                            <FaHeart/>
                                            Wishlist
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item logout-item"
                                            onClick={handleLogout}>
                                            <FaSignOutAlt/>
                                            Logout
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