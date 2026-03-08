import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaLeaf, 
  FaShippingFast, 
  FaCreditCard, 
  FaReceipt, 
  FaLock, 
  FaCheck, 
  FaCheckCircle, 
  FaSpinner,
  FaClipboardList,
  FaShoppingCart,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaHeart
} from 'react-icons/fa';
import { cartService } from '../services/cartService';
import { esewaService } from '../services/esewaService';
import { getUserFromToken } from '../utils/auth';
import Header from './Header';
import '../styles/Header.css';

const Payment = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [orderId, setOrderId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  
  // Form data states
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showMessage, setShowMessage] = useState('');
  
  // Green Points states
  const [greenPoints, setGreenPoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Display message helper
  const displayMessage = (message) => {
    setShowMessage(message);
    setTimeout(() => setShowMessage(''), 3000);
  };

  // Initialize component
  useEffect(() => {
    const initializePayment = async () => {
      const userInfo = getUserFromToken();
      setUser(userInfo);
      
      if (userInfo) {
        try {
          // Fetch full profile data including address
          const profileResponse = await fetch('http://127.0.0.1:8000/api/profile/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            // Pre-fill shipping data with profile information
            setShippingData(prev => ({
              ...prev,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: profileData.email || '',
              address: profileData.address || ''
            }));
          }
          
          // Load cart data
          const cartData = await cartService.getCart();
          setCartItems(cartData.items || []);
          
          // Fetch green points
          const pointsResponse = await fetch('http://127.0.0.1:8000/api/auth/green-points/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (pointsResponse.ok) {
            const pointsData = await pointsResponse.json();
            setGreenPoints(pointsData.balance || 0);
          }
        } catch (error) {
          console.error('Error loading payment data:', error);
        }
      }
      
      setLoading(false);
    };

    initializePayment();
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalItems = 0;
    
    cartItems.forEach(item => {
      subtotal += item.total_price;
      totalItems += item.quantity;
    });
    
    const shipping = 75; // Rs 75 flat shipping per order
    const tax = subtotal * 0.13; // 13% VAT in Nepal
    const total = subtotal + shipping + tax - pointsDiscount;
    
    return { subtotal, totalItems, shipping, tax, total };
  };

  // Handle green points redemption
  const handlePointsChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPointsToRedeem(value);
      
      if (value === '') {
        setPointsDiscount(0);
        return;
      }
      
      const points = parseInt(value);
      
      // Validate points
      if (points > greenPoints) {
        setErrors(prev => ({ ...prev, points: `You only have ${greenPoints} points` }));
        setPointsDiscount(0);
        return;
      }
      
      if (points < 50 && points > 0) {
        setErrors(prev => ({ ...prev, points: 'Minimum 50 points required' }));
        setPointsDiscount(0);
        return;
      }
      
      // Calculate discount (10 points = Rs 1)
      const discount = points / 10;
      const { subtotal, shipping, tax } = calculateTotals();
      const orderTotal = subtotal + shipping + tax;
      const maxDiscount = orderTotal * 0.5; // 50% max discount
      
      if (discount > maxDiscount) {
        setErrors(prev => ({ ...prev, points: `Maximum discount is 50% (${Math.floor(maxDiscount * 10)} points)` }));
        setPointsDiscount(0);
        return;
      }
      
      setErrors(prev => ({ ...prev, points: '' }));
      setPointsDiscount(discount);
    }
  };

  // Handle input changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation functions
  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!shippingData.address.trim()) newErrors.address = 'Address is required';
    if (!shippingData.city.trim()) newErrors.city = 'City is required';
    if (!shippingData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!shippingData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    return newErrors;
  };

  const validatePayment = () => {
    const newErrors = {};
    
    if (selectedPaymentMethod === 'card') {
      if (!paymentData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!paymentData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry in MM/YY format';
      }
      
      if (!paymentData.cvv.trim()) newErrors.cvv = 'CVV is required';
      else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
      
      if (!paymentData.cardName.trim()) newErrors.cardName = 'Name on card is required';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handlePlaceOrder = async () => {
    const shippingErrors = validateShipping();
    const paymentErrors = validatePayment();
    const allErrors = { ...shippingErrors, ...paymentErrors };
    
    if (!termsAccepted) {
      allErrors.terms = 'Please agree to the terms and conditions';
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // Handle different payment methods
    if (selectedPaymentMethod === 'esewa') {
      handleEsewaPayment();
      return;
    }
    
    if (selectedPaymentMethod === 'cod') {
      handleCODPayment();
      return;
    }
    
    // Handle credit card payment (default)
    setOrderLoading(true);
    
    try {
      // Create order through API
      const orderData = {
        points_to_redeem: pointsToRedeem ? parseInt(pointsToRedeem) : 0
      };
      
      const response = await fetch('http://127.0.0.1:8000/api/orders/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to order confirmation page with order data
        navigate('/order-confirmation', { 
          state: { order: data.order }
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Order failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Order failed. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle eSewa payment
  const handleEsewaPayment = async () => {
    setOrderLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.zipCode}`,
        phone_number: shippingData.phone,
        points_to_redeem: pointsToRedeem ? parseInt(pointsToRedeem) : 0
      };
      
      // Initiate eSewa payment
      const response = await esewaService.initiatePayment(orderData);
      
      if (response.payment_url && response.payment_data) {
        // Submit payment form to eSewa
        esewaService.submitPaymentForm(response.payment_url, response.payment_data);
      } else {
        alert('Failed to initiate eSewa payment. Please try again.');
        setOrderLoading(false);
      }
      
    } catch (error) {
      console.error('Error initiating eSewa payment:', error);
      alert(error.error || 'Failed to initiate payment. Please try again.');
      setOrderLoading(false);
    }
  };

  // Handle Cash on Delivery payment
  const handleCODPayment = async () => {
    setOrderLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.zipCode}`,
        phone_number: shippingData.phone,
        points_to_redeem: pointsToRedeem ? parseInt(pointsToRedeem) : 0
      };
      
      // Create COD order
      const response = await esewaService.createCODOrder(orderData);
      
      if (response.order) {
        // Redirect to order confirmation page
        navigate('/order-confirmation', { 
          state: { order: response.order }
        });
      } else {
        alert('Failed to create order. Please try again.');
      }
      
    } catch (error) {
      console.error('Error creating COD order:', error);
      alert(error.error || 'Failed to create order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle Khalti payment (placeholder)
  const handleKhaltiPayment = async () => {
    alert('Khalti payment integration coming soon!');
  };

  const { subtotal, totalItems, shipping, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="payment-page">
        <Header cartCount={0} />
        <div className="container">
          <div className="empty-cart-message">
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before checkout.</p>
            <Link to="/products" className="btn-continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {/* Header */}
      <Header cartCount={totalItems} />

      {/* Message Display */}
      {showMessage && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: '#2E7D32',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {showMessage}
        </div>
      )}

      {/* Checkout Steps */}
      <div className="checkout-steps">
        <div className="container">
          <div className="steps-container">
            <div className="step completed">
              <div className="step-number">
                <FaCheck />
              </div>
              <span className="step-label">Cart</span>
            </div>
            <div className="step-connector completed"></div>
            <div className="step active">
              <div className="step-number">2</div>
              <span className="step-label">Checkout</span>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Container */}
      <div className="container">
        <div className="checkout-container">
          {/* Checkout Form */}
          <div className="checkout-form">
            {/* Shipping Information */}
            <div className="form-section">
              <div className="section-header">
                <FaShippingFast />
                <h2>Shipping Information</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={`form-control ${errors.firstName ? 'error' : ''}`}
                    value={shippingData.firstName}
                    onChange={handleShippingChange}
                    required
                  />
                  {errors.firstName && <div className="error-message show">{errors.firstName}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className={`form-control ${errors.lastName ? 'error' : ''}`}
                    value={shippingData.lastName}
                    onChange={handleShippingChange}
                    required
                  />
                  {errors.lastName && <div className="error-message show">{errors.lastName}</div>}
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    value={shippingData.email}
                    onChange={handleShippingChange}
                    required
                  />
                  {errors.email && <div className="error-message show">{errors.email}</div>}
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="address">Shipping Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className={`form-control ${errors.address ? 'error' : ''}`}
                    value={shippingData.address}
                    onChange={handleShippingChange}
                    required
                  />
                  {errors.address && <div className="error-message show">{errors.address}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`form-control ${errors.city ? 'error' : ''}`}
                    value={shippingData.city}
                    onChange={handleShippingChange}
                    required
                  />
                  {errors.city && <div className="error-message show">{errors.city}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    className={`form-control ${errors.zipCode ? 'error' : ''}`}
                    value={shippingData.zipCode}
                    onChange={handleShippingChange}
                    required
                  />
                  {errors.zipCode && <div className="error-message show">{errors.zipCode}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form-control ${errors.phone ? 'error' : ''}`}
                  value={shippingData.phone}
                  onChange={handleShippingChange}
                  required
                />
                {errors.phone && <div className="error-message show">{errors.phone}</div>}
              </div>
            </div>

            {/* Payment Information */}
            <div className="form-section">
              <div className="section-header">
                <FaCreditCard />
                <h2>Payment Information</h2>
              </div>
              
              <div className="payment-methods">
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('card')}
                >
                  <FaCreditCard />
                  <div className="method-name">Credit Card</div>
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'esewa' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('esewa')}
                >
                  <img src="https://esewa.com.np/common/images/esewa-icon-large.png" alt="eSewa" style={{width: '32px', height: '32px'}} />
                  <div className="method-name">eSewa</div>
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'khalti' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('khalti')}
                >
                  <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" style={{width: '32px', height: '32px'}} />
                  <div className="method-name">Khalti</div>
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('cod')}
                >
                  <FaReceipt />
                  <div className="method-name">Cash on Delivery</div>
                </div>
              </div>
              
              {selectedPaymentMethod === 'card' && (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className={`form-control ${errors.cardNumber ? 'error' : ''}`}
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentChange}
                      required
                    />
                    {errors.cardNumber && <div className="error-message show">{errors.cardNumber}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date *</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      className={`form-control ${errors.expiryDate ? 'error' : ''}`}
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={handlePaymentChange}
                      required
                    />
                    {errors.expiryDate && <div className="error-message show">{errors.expiryDate}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      className={`form-control ${errors.cvv ? 'error' : ''}`}
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={handlePaymentChange}
                      required
                    />
                    {errors.cvv && <div className="error-message show">{errors.cvv}</div>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="cardName">Name on Card *</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      className={`form-control ${errors.cardName ? 'error' : ''}`}
                      value={paymentData.cardName}
                      onChange={handlePaymentChange}
                      required
                    />
                    {errors.cardName && <div className="error-message show">{errors.cardName}</div>}
                  </div>
                </div>
              )}
              
              {selectedPaymentMethod === 'esewa' && (
                <div className="form-group full-width" style={{textAlign: 'center', padding: '30px 0'}}>
                  <p>You will be redirected to eSewa to complete your payment securely.</p>
                  <button 
                    type="button" 
                    className="payment-gateway-btn esewa-btn"
                    onClick={handleEsewaPayment}
                  >
                    <img src="https://esewa.com.np/common/images/esewa-icon-large.png" alt="eSewa" style={{width: '24px', height: '24px'}} />
                    <span>Pay with eSewa</span>
                  </button>
                </div>
              )}
              
              {selectedPaymentMethod === 'khalti' && (
                <div className="form-group full-width" style={{textAlign: 'center', padding: '30px 0'}}>
                  <p>Complete your payment securely with Khalti.</p>
                  <button 
                    type="button" 
                    className="payment-gateway-btn khalti-btn"
                    onClick={handleKhaltiPayment}
                  >
                    <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" style={{width: '24px', height: '24px'}} />
                    <span>Pay with Khalti</span>
                  </button>
                </div>
              )}
              
              {selectedPaymentMethod === 'cod' && (
                <div className="form-group full-width" style={{textAlign: 'center', padding: '30px 0'}}>
                  <div style={{
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <FaReceipt style={{fontSize: '48px', color: '#2E7D32', marginBottom: '15px'}} />
                    <h3 style={{color: '#2E7D32', marginBottom: '10px'}}>Cash on Delivery</h3>
                    <p style={{color: '#666', marginBottom: '0'}}>
                      Pay with cash when your order is delivered to your doorstep.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <div className="summary-header">
                <FaReceipt />
                <h2>Order Summary</h2>
              </div>
              
              <div className="cart-items-preview">
                {cartItems.map(item => (
                  <div key={item.id} className="preview-item">
                    <div className="preview-image">
                      <img src={item.product.image_url || item.product.image} alt={item.product.name} />
                    </div>
                    <div className="preview-details">
                      <div className="preview-name">{item.product.name}</div>
                      <div className="preview-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>Rs {Math.round(item.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>Rs {Math.round(subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>Rs {Math.round(shipping)}</span>
                </div>
                <div className="total-row">
                  <span>Estimated Tax (VAT)</span>
                  <span>Rs {Math.round(tax)}</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="total-row discount">
                    <span>Green Points Discount</span>
                    <span>- Rs {Math.round(pointsDiscount)}</span>
                  </div>
                )}
                <div className="total-row total">
                  <span>Total</span>
                  <span>Rs {Math.round(total)}</span>
                </div>
              </div>
              
              {/* Green Points Redemption */}
              <div className="green-points-redemption">
                <h4>🌿 Use Green Points</h4>
                <div className="points-balance-info">
                  <span>Available:</span>
                  <span className="points-value">{greenPoints} points</span>
                </div>
                <div className="points-input-group">
                  <input
                    type="text"
                    placeholder="Enter points"
                    value={pointsToRedeem}
                    onChange={handlePointsChange}
                    className={`points-input ${errors.points ? 'error' : ''}`}
                  />
                  <button 
                    className="btn-apply-points"
                    onClick={() => {
                      if (pointsToRedeem && !errors.points) {
                        displayMessage(`Applied ${pointsToRedeem} points!`);
                      }
                    }}
                    disabled={!pointsToRedeem || errors.points}
                  >
                    Apply
                  </button>
                </div>
                {errors.points && <div className="error-message show">{errors.points}</div>}
                <div className="points-info-text">
                  <p>• 10 points = Rs 1 off</p>
                  <p>• Min 50 points, Max 50% discount</p>
                </div>
              </div>
              
              <div className="eco-impact">
                <h4><FaLeaf /> Your Eco Impact</h4>
                <p>This order saves approximately <strong>Rs {Math.round(total * 0.02)}</strong> in environmental costs and prevents <strong>{(totalItems * 0.5).toFixed(1)} kg</strong> of plastic waste.</p>
              </div>
              
              <div className="terms-checkbox">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required 
                />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms of Service</a> and have read the <a href="#">Privacy Policy</a>. I understand that my order supports sustainable practices.
                </label>
              </div>
              {errors.terms && <div className="error-message show">{errors.terms}</div>}
              
              <button 
                className={`btn-place-order ${orderLoading ? 'loading' : ''}`}
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                style={{
                  display: (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'cod') ? 'flex' : 'none'
                }}
              >
                {orderLoading ? <FaSpinner className="spinning" /> : <FaLock />}
                <span>{orderLoading ? 'Processing Order...' : (selectedPaymentMethod === 'cod' ? 'Confirm Order' : 'Place Order')}</span>
              </button>

              {/* Show payment instructions for gateway methods */}
              {(selectedPaymentMethod === 'esewa' || selectedPaymentMethod === 'khalti') && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: 'rgba(46, 125, 50, 0.1)',
                  borderRadius: '12px',
                  border: '2px solid rgba(46, 125, 50, 0.2)',
                  marginTop: '20px'
                }}>
                  <p style={{
                    color: '#1B5E20',
                    fontWeight: '600',
                    margin: '0 0 10px 0'
                  }}>
                    Complete Payment to Place Order
                  </p>
                  <p style={{
                    color: '#666666',
                    fontSize: '0.9rem',
                    margin: '0'
                  }}>
                    Click the payment button above to proceed with {selectedPaymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-icon">
              <FaCheckCircle />
            </div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for choosing sustainable shopping with Ecomarket. Your order has been placed successfully.</p>
            
            <div className="order-details">
              <h4>Order Details</h4>
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Total Amount:</strong> Rs {Math.round(total)}</p>
              <p><strong>Estimated Delivery:</strong> {deliveryDate}</p>
              <p>A confirmation email has been sent to your email address.</p>
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn btn-view-orders" onClick={() => alert('Orders page not implemented yet')}>
                <FaClipboardList />
                View Orders
              </button>
              <button className="modal-btn btn-continue-shopping" onClick={() => navigate('/products')}>
                <FaShoppingCart />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Ecomarket</h3>
              <p>Your trusted marketplace for sustainable, eco-friendly products. Making green shopping accessible to everyone.</p>
              <div className="social-icons">
                <a href="#"><FaFacebookF /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaInstagram /></a>
                <a href="#"><FaLinkedinIn /></a>
              </div>
            </div>
            
            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/products">Home</Link></li>
                <li><Link to="/products">Shop</Link></li>
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
                <li><FaMapMarkerAlt /> Bhagwati Marg, Naxal</li>
                <li><FaPhone /> 9876543210</li>
                <li><FaEnvelope /> ecomarket@gmail.com</li>
              </ul>
            </div>
          </div>
          
          <div className="copyright">
            <p>&copy; 2026 Ecomarket. All rights reserved. | Designed with <FaHeart style={{color:'#ff6b6b'}} /> for a sustainable future.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .payment-page {
          background-color: #F9F7F3;
          color: #333333;
          line-height: 1.6;
          min-height: 100vh;
        }

        .container {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #2E7D32;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .empty-cart-message {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-cart-message h2 {
          color: #1B5E20;
          margin-bottom: 15px;
        }

        .btn-continue-shopping {
          display: inline-block;
          padding: 15px 30px;
          background-color: #2E7D32;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin-top: 20px;
          transition: background-color 0.3s;
        }

        .btn-continue-shopping:hover {
          background-color: #1B5E20;
        }

        /* Checkout Steps */
        .checkout-steps {
          padding: 30px 0;
          background-color: rgba(46, 125, 50, 0.05);
          margin-bottom: 40px;
        }

        .steps-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #666666;
        }

        .step.active {
          color: #2E7D32;
        }

        .step.completed {
          color: #1B5E20;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #F9F7F3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 2px solid #e0e0e0;
        }

        .step.active .step-number {
          background-color: #2E7D32;
          color: white;
          border-color: #2E7D32;
        }

        .step.completed .step-number {
          background-color: #1B5E20;
          color: white;
          border-color: #1B5E20;
        }

        .step-connector {
          flex: 1;
          height: 2px;
          background-color: #e0e0e0;
          min-width: 60px;
        }

        .step-connector.completed {
          background-color: #1B5E20;
        }

        .step-label {
          font-weight: 600;
          font-size: 1rem;
        }

        /* Checkout Layout */
        .checkout-container {
          display: flex;
          gap: 40px;
          margin-bottom: 60px;
        }

        /* Checkout Form */
        .checkout-form {
          flex: 2;
        }

        .form-section {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #F9F7F3;
        }

        .section-header svg {
          font-size: 24px;
          color: #2E7D32;
        }

        .section-header h2 {
          font-size: 1.5rem;
          color: #1B5E20;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333333;
        }

        .form-control {
          width: 100%;
          padding: 14px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s;
          background-color: #f9f9f9;
        }

        .form-control:focus {
          outline: none;
          border-color: #2E7D32;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-control.error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 0.9rem;
          margin-top: 5px;
          display: none;
        }

        .error-message.show {
          display: block;
        }

        /* Payment Methods */
        .payment-methods {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .payment-method {
          flex: 1;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .payment-method:hover {
          border-color: #2E7D32;
        }

        .payment-method.selected {
          border-color: #2E7D32;
          background-color: rgba(76, 175, 80, 0.05);
        }

        .payment-method svg {
          font-size: 32px;
          color: #666666;
        }

        .payment-method.selected svg {
          color: #2E7D32;
        }

        .method-name {
          font-weight: 600;
          color: #333333;
        }

        /* Order Summary */
        .order-summary {
          flex: 1;
        }

        .summary-card {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 100px;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #F9F7F3;
        }

        .summary-header h2 {
          font-size: 1.5rem;
          color: #1B5E20;
        }

        .cart-items-preview {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 25px;
        }

        .preview-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #F9F7F3;
        }

        .preview-item:last-child {
          border-bottom: none;
        }

        .preview-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-details {
          flex: 1;
        }

        .preview-name {
          font-weight: 600;
          margin-bottom: 5px;
          font-size: 0.95rem;
        }

        .preview-meta {
          display: flex;
          justify-content: space-between;
          color: #666666;
          font-size: 0.9rem;
        }

        .summary-totals {
          margin: 25px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #666666;
        }

        .total-row.total {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1B5E20;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #F9F7F3;
        }

        .eco-impact {
          background-color: rgba(139, 195, 74, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin: 25px 0;
          border-left: 4px solid #8BC34A;
        }

        .eco-impact h4 {
          color: #1B5E20;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .eco-impact p {
          color: #666666;
          font-size: 0.9rem;
        }

        /* Green Points Redemption */
        .green-points-redemption {
          background: #f5f5f5;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 2px solid #2E7D32;
        }

        .green-points-redemption h4 {
          color: #1B5E20;
          margin: 0 0 15px 0;
          font-size: 1.1rem;
        }

        .points-balance-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: white;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 0.95rem;
          border: 1px solid #ddd;
        }

        .points-value {
          font-weight: 700;
          color: #2E7D32;
          font-size: 1rem;
        }

        .points-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .points-input {
          flex: 1;
          padding: 10px 15px;
          border: 2px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
        }

        .points-input:focus {
          outline: none;
          border-color: #2E7D32;
        }

        .points-input.error {
          border-color: #f44336;
        }

        .btn-apply-points {
          padding: 10px 20px;
          background-color: #2E7D32;
          color: white;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-apply-points:hover:not(:disabled) {
          background-color: #1B5E20;
        }

        .btn-apply-points:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .points-info-text {
          margin-top: 10px;
        }

        .points-info-text p {
          margin: 5px 0;
          font-size: 0.85rem;
          color: #666;
        }

        .total-row.discount {
          color: #2E7D32;
          font-weight: 600;
        }

        .terms-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 25px 0;
        }

        .terms-checkbox input {
          margin-top: 4px;
          accent-color: #2E7D32;
        }

        .terms-checkbox label {
          font-size: 0.95rem;
          color: #666666;
        }

        .terms-checkbox a {
          color: #2E7D32;
          text-decoration: none;
        }

        .terms-checkbox a:hover {
          text-decoration: underline;
        }

        .btn-place-order {
          width: 100%;
          padding: 18px;
          background-color: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-place-order:hover:not(:disabled) {
          background-color: #1B5E20;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-place-order:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-place-order.loading {
          opacity: 0.8;
        }

        /* Payment Gateway Buttons */
        .payment-gateway-btn {
          width: 100%;
          max-width: 300px;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 20px auto;
          text-decoration: none;
          color: white;
        }

        .esewa-btn {
          background-color: #1B5E20;
          box-shadow: 0 4px 15px rgba(27, 94, 32, 0.3);
        }

        .esewa-btn:hover {
          background-color: #0D4E14;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(27, 94, 32, 0.4);
        }

        .khalti-btn {
          background-color: #1B5E20;
          box-shadow: 0 4px 15px rgba(27, 94, 32, 0.3);
        }

        .khalti-btn:hover {
          background-color: #0D4E14;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(27, 94, 32, 0.4);
        }

        .payment-gateway-btn:active {
          transform: translateY(0);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          opacity: 1;
          visibility: visible;
        }

        .modal {
          background-color: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          text-align: center;
        }

        .modal-icon {
          font-size: 80px;
          color: #4CAF50;
          margin-bottom: 20px;
        }

        .modal h2 {
          font-size: 2rem;
          color: #1B5E20;
          margin-bottom: 15px;
        }

        .modal p {
          color: #666666;
          margin-bottom: 30px;
        }

        .order-details {
          background-color: #F9F7F3;
          border-radius: 10px;
          padding: 20px;
          margin: 25px 0;
          text-align: left;
        }

        .order-details h4 {
          color: #1B5E20;
          margin-bottom: 15px;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
        }

        .modal-btn {
          flex: 1;
          padding: 15px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-view-orders {
          background-color: #2E7D32;
          color: white;
          border: none;
        }

        .btn-view-orders:hover {
          background-color: #1B5E20;
        }

        .btn-continue-shopping {
          background-color: transparent;
          border: 2px solid #2E7D32;
          color: #2E7D32;
        }

        .btn-continue-shopping:hover {
          background-color: rgba(46, 125, 50, 0.1);
        }

        /* Footer */
        footer {
          background-color: #1B5E20;
          color: white;
          padding: 70px 0 30px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 50px;
        }

        .footer-column h3 {
          font-size: 1.5rem;
          margin-bottom: 25px;
          color: #8BC34A;
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 15px;
        }

        .footer-links a {
          color: #ddd;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: #8BC34A;
        }

        .social-icons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .social-icons a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          text-decoration: none;
          transition: background-color 0.3s;
        }

        .social-icons a:hover {
          background-color: #8BC34A;
        }

        .copyright {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #aaa;
          font-size: 0.9rem;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .checkout-container {
            flex-direction: column;
          }
          
          .steps-container {
            flex-wrap: wrap;
            gap: 20px;
          }
          
          .step-connector {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .payment-methods {
            flex-direction: column;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .step {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }
          
          .section-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
          
          .form-section {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Payment;