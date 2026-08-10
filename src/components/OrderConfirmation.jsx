import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
    FaCheckCircle, FaTimesCircle, FaHome, FaShoppingCart, FaLeaf, FaCalendarAlt, 
    FaHashtag, FaRupeeSign, FaBox, FaChevronRight 
} from 'react-icons/fa';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import '../styles/ShoppingCart.css';
import Footer from './Footer';
import API_BASE_URL from "../config"; = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentFailed, setPaymentFailed] = useState(false);

    useEffect(() => {
        const initializeOrder = async () => {
            const userInfo = getUserFromToken();
            setUser(userInfo);

            // Case 1: Khalti / eSewa callback via URL params
            const orderId = searchParams.get('order_id');
            const status = searchParams.get('status');

            if (orderId) {
                if (status === 'failed') {
                    setPaymentFailed(true);
                    setLoading(false);
                    return;
                }
                // Fetch the order from the API
                try {
                const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/track/`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access')}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        // Build a minimal order object compatible with the UI
                        setOrder({
                            id: data.order_id,
                            status: data.current_status,
                            total_amount: data.total_amount,
                            created_at: data.created_at,
                            payment_method: data.payment_method,
                            points_earned: 0,
                            points_redeemed: 0,
                            points_discount: 0,
                            items: [],
                        });
                    } else {
                        setPaymentFailed(true);
                    }
                } catch {
                    setPaymentFailed(true);
                }
                setLoading(false);
                return;
            }

            // Case 2: Navigated directly with order in location.state (COD / card)
            if (location.state?.order) {
                setOrder(location.state.order);
                setLoading(false);
                return;
            }

            // Case 3: No order data at all — redirect to cart
            navigate('/cart');
        };

        initializeOrder();
    }, []);

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

    if (paymentFailed) {
        return (
            <div className="shopping-cart-page">
                <Header showBackButton={false} />
                <div className="container">
                    <div className="empty-cart" style={{ color: '#c62828' }}>
                        <FaTimesCircle style={{ fontSize: '5rem', color: '#c62828', marginBottom: 20 }} />
                        <h2>Payment Failed</h2>
                        <p>Your payment was not completed. No charges were made.</p>
                        <button onClick={() => navigate('/checkout')} className="btn-shop" style={{ marginTop: 20 }}>
                            <FaShoppingCart />
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
                <Footer />
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
                        <button onClick={() => navigate('/main')} style={{background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
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
                                Items Ordered {order.items?.length > 0 && `(${order.items.length} ${order.items.length === 1 ? 'item' : 'items'})`}
                            </h3>
                            {order.items?.length > 0 ? (
                            <div className="confirmed-items">
                                {order.items.map(item => (
                                    <div key={item.id} className="confirmed-item">
                                        <div className="item-image">
                                            <img 
                                                src={getImageUrl(item.product.image_url, item.product.image)} 
                                                alt={item.product.name}
                                                onError={handleImageError}
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
                            ) : (
                                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                    Your items are being processed. Check your order history for details.
                                </p>
                            )}
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
                                onClick={() => navigate('/main')} 
                                className="btn-continue-shopping"
                            >
                                <FaHome />
                                Continue Shopping
                            </button>
                            <button 
                                onClick={() => navigate(`/track-order/${order.id}`)} 
                                className="btn-view-orders"
                            >
                                <FaBox />
                                Track Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrderConfirmation;