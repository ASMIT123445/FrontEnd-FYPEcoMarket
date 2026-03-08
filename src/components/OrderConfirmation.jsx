import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    FaCheckCircle, FaHome, FaShoppingCart, FaLeaf, FaCalendarAlt, 
    FaHashtag, FaRupeeSign, FaBox, FaChevronRight 
} from 'react-icons/fa';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';
import '../styles/ShoppingCart.css';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeOrder = async () => {
            const userInfo = getUserFromToken();
            setUser(userInfo);

            // Get order data from location state or create new order
            if (location.state?.order) {
                setOrder(location.state.order);
                setLoading(false);
            } else {
                // If no order data, try to create order from cart
                await createOrderFromCart();
            }
        };

        initializeOrder();
    }, [location.state]);

    const createOrderFromCart = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/orders/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrder(data.order);
            } else {
                console.error('Error creating order:', response.statusText);
                // Redirect to cart if order creation fails
                navigate('/cart');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            confirmed: '#28a745',
            shipped: '#007bff',
            delivered: '#17a2b8',
            cancelled: '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    if (loading) {
        return (
            <div className="shopping-cart-page">
                <Header showBackButton={false} />
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Processing your order...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="shopping-cart-page">
                <Header showBackButton={false} />
                <div className="container">
                    <div className="empty-cart">
                        <FaShoppingCart />
                        <h2>No Order Found</h2>
                        <p>We couldn't find your order. Please try again.</p>
                        <button onClick={() => navigate('/cart')} className="btn-shop">
                            <FaShoppingCart />
                            <span>Back to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shopping-cart-page">
            <Header showBackButton={false} />

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="container">
                    <div className="breadcrumb-content">
                        <button onClick={() => navigate('/products')} style={{background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <FaHome /> Home
                        </button>
                        <FaChevronRight />
                        <button onClick={() => navigate('/cart')} style={{background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer'}}>
                            Cart
                        </button>
                        <FaChevronRight />
                        <span>Order Confirmation</span>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Success Message */}
                <div className="order-success">
                    <div className="success-icon">
                        <FaCheckCircle />
                    </div>
                    <h1>Order Confirmed!</h1>
                    <p>Thank you for your eco-friendly purchase. Your order has been successfully placed.</p>
                </div>

                {/* Order Details */}
                <div className="order-confirmation-container">
                    <div className="order-summary-card">
                        <div className="order-header">
                            <h2>Order Summary</h2>
                            <div className="order-meta">
                                <div className="order-id">
                                    <FaHashtag />
                                    <span>Order #{order.id}</span>
                                </div>
                                <div className="order-date">
                                    <FaCalendarAlt />
                                    <span>{formatDate(order.created_at)}</span>
                                </div>
                                <div className="order-status">
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="order-items-section">
                            <h3>
                                <FaBox />
                                Items Ordered ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                            </h3>
                            <div className="confirmed-items">
                                {order.items.map(item => (
                                    <div key={item.id} className="confirmed-item">
                                        <div className="item-image">
                                            <img 
                                                src={item.product.image_url || item.product.image} 
                                                alt={item.product.name}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                                }}
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.product.name}</h4>
                                            <p className="item-category">Eco-Friendly Product</p>
                                            <div className="item-pricing">
                                                <span className="quantity">Qty: {item.quantity}</span>
                                                <span className="unit-price">Rs {Math.round(item.price)} each</span>
                                                <span className="total-price">Rs {Math.round(item.total_price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Total */}
                        <div className="order-total-section">
                            <div className="total-row">
                                <span>Order Total</span>
                                <span className="total-amount">
                                    <FaRupeeSign />
                                    Rs {Math.round(order.total_amount)}
                                </span>
                            </div>
                            {order.points_redeemed > 0 && (
                                <div className="points-redeemed-info">
                                    <span>🎉 Used {order.points_redeemed} points (Rs {Math.round(order.points_discount)} off)</span>
                                </div>
                            )}
                            {order.points_earned > 0 && (
                                <div className="points-earned-info">
                                    <span>🌿 Earned {order.points_earned} Green Points!</span>
                                </div>
                            )}
                        </div>

                        {/* Eco Impact */}
                        <div className="eco-impact">
                            <FaLeaf />
                            <div>
                                <h4>Environmental Impact</h4>
                                <p>By choosing eco-friendly products, you've helped reduce environmental impact and supported sustainable practices!</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="confirmation-actions">
                            <button 
                                onClick={() => navigate('/products')} 
                                className="btn-continue-shopping"
                            >
                                <FaHome />
                                Continue Shopping
                            </button>
                            <button 
                                onClick={() => navigate('/cart')} 
                                className="btn-view-orders"
                            >
                                <FaShoppingCart />
                                View Purchase History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;