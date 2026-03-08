import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaChevronRight, FaShoppingCart, FaLeaf, FaMinus, FaPlus, FaTrash, FaLock, FaCheckCircle } from 'react-icons/fa';
import { getUserFromToken } from '../utils/auth';
import { cartService } from '../services/cartService';
import Header from './Header';
import '../styles/ShoppingCart.css';
import '../styles/Header.css';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showMessage, setShowMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Initialize user and fetch cart
  useEffect(() => {
    const initializeCart = async () => {
      const userInfo = getUserFromToken();
      setUser(userInfo);
      
      if (userInfo) {
        try {
          // Get cart items from Django API
          const cartData = await cartService.getCart();
          console.log('Cart data loaded:', cartData); // Debug log
          setCartItems(cartData.items || []);
          
          // Fetch order history
          await fetchOrderHistory();
        } catch (error) {
          console.error('Error loading cart:', error);
          setCartItems([]);
        }
      }
      
      setLoading(false);
    };

    initializeCart();
  }, []);

  // Fetch order history
  const fetchOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/orders/history/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data);
      } else {
        console.error('Error fetching order history:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Listen for cart updates (when user navigates to cart page)
  useEffect(() => {
    const handleFocus = async () => {
      // Refresh cart items when page gets focus
      if (user) {
        try {
          const cartData = await cartService.getCart();
          console.log('Cart refreshed on focus:', cartData);
          setCartItems(cartData.items || []);
        } catch (error) {
          console.error('Error refreshing cart:', error);
        }
      }
    };

    // Also refresh when component mounts or when location changes
    const refreshCart = async () => {
      if (user) {
        try {
          const cartData = await cartService.getCart();
          console.log('Cart refreshed:', cartData);
          setCartItems(cartData.items || []);
        } catch (error) {
          console.error('Error refreshing cart:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    
    // Refresh cart immediately if user is available
    if (user) {
      refreshCart();
    }
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalItems = 0;
    
    console.log('Calculating totals for cart items:', cartItems); // Debug log
    
    cartItems.forEach(item => {
      console.log(`Item: ${item.product?.name}, Quantity: ${item.quantity}, Unit Price: ${item.product?.price}, Total Price: ${item.total_price}`); // Debug log
      subtotal += item.total_price;
      totalItems += item.quantity;
    });
    
    console.log(`Subtotal: ${subtotal}, Total Items: ${totalItems}`); // Debug log
    
    const shipping = 75; // Rs 75 flat shipping per order
    const tax = subtotal * 0.13; // 
    const total = subtotal + shipping + tax;
    const ecoSavings = subtotal * 0.02; // 2% eco savings estimate
    
    return { subtotal, totalItems, shipping, tax, total, ecoSavings };
  };

  // Update quantity
  const updateQuantity = async (itemId, change) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    
    if (newQuantity > item.product.stock) {
      displayMessage(`Only ${item.product.stock} items available in stock`);
      return;
    }
    
    try {
      // Update cart using Django API
      await cartService.updateCartItem(itemId, newQuantity);
      
      // Update local state
      const updatedItems = cartItems.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      setCartItems(updatedItems);
      displayMessage(`Updated quantity to ${newQuantity}`);
    } catch (error) {
      console.error('Error updating quantity:', error);
      displayMessage('Error updating quantity. Please try again.');
    }
  };

  // Remove from cart
  const handleRemoveFromCart = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    try {
      // Remove item using Django API
      await cartService.removeFromCart(itemId);
      
      // Update local state
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      displayMessage('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      displayMessage('Error removing item. Please try again.');
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add some eco-friendly products first!');
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  // Display message
  const displayMessage = (text) => {
    setShowMessage(text);
    setTimeout(() => setShowMessage(''), 3000);
  };

  const { subtotal, totalItems, shipping, tax, total, ecoSavings } = calculateTotals();

  if (loading) {
    return (
      <div className="shopping-cart-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart-page">
      {/* Header */}
      <Header 
        showBackButton={false}
        cartCount={totalItems}
      />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <div className="breadcrumb-content">
            <Link to="/products">
              <FaHome /> Home
            </Link>
            <FaChevronRight />
            <span>Your Shopping Cart</span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {showMessage && (
        <div className="message-popup">
          <FaCheckCircle /> {showMessage}
        </div>
      )}

      {/* Cart Container */}
      <div className="container">
        <div className="cart-container">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <FaShoppingCart />
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any eco-friendly products to your cart yet. Start shopping for sustainable goods!</p>
              <Link to="/products" className="btn-shop">
                
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items">
                <div className="cart-header">
                  <h1>Your Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
                  <p>Review your eco-friendly items before checkout</p>
                </div>
                
                {cartItems.map(item => {
                  const itemTotal = item.total_price;
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img src={item.product.image_url || item.product.image} alt={item.product.name} />
                      </div>
                      <div className="item-details">
                        <div className="item-header">
                          <div>
                            <h3 className="item-title">{item.product.name}</h3>
                            <div className="item-category">Eco-Friendly Product</div>
                          </div>
                          <div>
                            <div className="item-price">
                              Rs {Math.round(item.product.price)}
                            </div>
                          </div>
                        </div>
                        <p className="item-description">{item.product.description}</p>
                        <div className="item-actions">
                          <div className="quantity-control">
                            <button 
                              className="qty-btn" 
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <FaMinus />
                            </button>
                            <span className="qty-value">{item.quantity}</span>
                            <button 
                              className="qty-btn" 
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <FaPlus />
                            </button>
                          </div>
                          <button 
                            className="remove-item" 
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <FaTrash />
                            Remove Item
                          </button>
                        </div>
                      </div>
                      <div className="item-subtotal">
                        Rs {Math.round(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-card">
                  <h3 className="summary-title">Order Summary</h3>
                  
                  <div className="summary-row">
                    <span className="summary-label">Subtotal ({totalItems} items)</span>
                    <span className="summary-value">Rs {Math.round(subtotal)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value">
                      Rs {Math.round(shipping)}
                    </span>
                  </div>
                  
                  <div className="summary-row">
                    <span className="summary-label">Estimated Tax </span>
                    <span className="summary-value">Rs {Math.round(tax)}</span>
                  </div>
                  
                  <div className="eco-savings">
                    <h4><FaLeaf /> Eco Impact</h4>
                    <p>Your sustainable choices are saving approximately <strong>Rs {Math.round(ecoSavings)}</strong> in environmental costs and preventing <strong>{(totalItems * 0.5).toFixed(1)} kg</strong> of plastic waste.</p>
                  </div>
                  
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>Rs {Math.round(total)}</span>
                  </div>
                  
                  <button className="btn-checkout" onClick={proceedToCheckout}>
                    <FaLock />
                    <span>Proceed to Checkout</span>
                  </button>
                  
                  <Link to="/products" className="continue-shopping">
                    <FaArrowLeft />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Purchase History Section */}
        <div className="purchase-history-section">
          <div className="history-header">
            <h2>Recent Purchases</h2>
            <button 
              className="toggle-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide History' : 'View Purchase History'}
            </button>
          </div>
          
          {showHistory && (
            <div className="history-content">
              {historyLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading purchase history...</p>
                </div>
              ) : orderHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No purchase history found. Start shopping to see your orders here!</p>
                </div>
              ) : (
                <div className="history-list">
                  {orderHistory.map(order => (
                    <div key={order.id} className="history-item">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>Order #{order.id}</h4>
                          <span className="order-date">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="order-total">Rs {Math.round(order.total_amount)}</span>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        {order.items.slice(0, 3).map(item => (
                          <div key={item.id} className="history-product">
                            <img 
                              src={item.product.image_url || item.product.image} 
                              alt={item.product.name}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            <div className="product-info">
                              <span className="product-name">{item.product.name}</span>
                              <span className="product-details">Qty: {item.quantity} × Rs {Math.round(item.price)}</span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="more-items">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Ecomarket</h3>
              <p>Your trusted marketplace for sustainable, eco-friendly products. Making green shopping accessible to everyone.</p>
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            
            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/products">Home</Link></li>
                <li><Link to="/products#categories">Shop</Link></li>
                <li><a href="#">Categories</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Categories</h3>
              <ul className="footer-links">
                <li><a href="#">Recycled Items</a></li>
                <li><a href="#">Organic Products</a></li>
                <li><a href="#">Energy-Efficient</a></li>
                <li><a href="#">Reusable Household</a></li>
                <li><a href="#">Handmade Crafts</a></li>
              </ul>
            </div>
            
            
            <div className="footer-column">
              <h3>Contact Us</h3>
              <ul className="footer-links">
                <li><i class="fas fa-map-marker-alt"></i>Bhagwati Marg, Naxal</li>
                        <li><i class="fas fa-phone"></i> + 977 9876543210</li>
                        <li><i class="fas fa-envelope"></i> info@ecomarket.com</li>
              </ul>
            </div>
          </div>
          
          <div className="copyright">
            <p>&copy; 2026 Ecomarket. All rights reserved. | Designed with <i className="fas fa-heart" style={{color:'#ff6b6b'}}></i> for a sustainable future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShoppingCart;