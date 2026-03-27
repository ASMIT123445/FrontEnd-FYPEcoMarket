import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBox, FaPlus, FaEdit, FaTrash, FaEye, FaChartLine, 
    FaClipboardList, FaHome, FaArrowLeft, FaDollarSign,
    FaCheckCircle, FaClock, FaTimes as FaTimesCircle
} from 'react-icons/fa';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';
import axiosInstance from '../services/axiosInstance';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import '../styles/SellerDashboard.css';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        verifiedProducts: 0,
        pendingProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initUser = async () => {
            const userInfo = getUserFromToken();
            if (!userInfo) {
                navigate('/products');
                return;
            }
            
            // Fetch full profile to get role
            try {
                const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const profileData = await response.json();
                    if (profileData.role !== 'seller') {
                        alert('Access denied. Seller account required.');
                        navigate('/products');
                        return;
                    }
                    setUser(profileData);
                    fetchDashboardData();
                } else {
                    navigate('/products');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                navigate('/products');
            }
        };

        initUser();
    }, [navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch products
            const productsRes = await axiosInstance.get('/products/seller/my-products/');
            setProducts(productsRes.data);

            // Fetch orders
            const ordersRes = await axiosInstance.get('/orders/seller/orders/');
            setOrders(ordersRes.data);

            // Calculate stats
            const verified = productsRes.data.filter(p => p.is_validated).length;
            const pending = productsRes.data.filter(p => !p.is_validated).length;
            const revenue = ordersRes.data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

            setStats({
                totalProducts: productsRes.data.length,
                verifiedProducts: verified,
                pendingProducts: pending,
                totalOrders: ordersRes.data.length,
                totalRevenue: revenue
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set empty data on error instead of crashing
            setProducts([]);
            setOrders([]);
            setStats({
                totalProducts: 0,
                verifiedProducts: 0,
                pendingProducts: 0,
                totalOrders: 0,
                totalRevenue: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
        
        try {
            await axiosInstance.delete(`/products/${productId}/`);
            alert('Product deleted successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating order status');
        }
    };

    if (loading) {
        return (
            <div className="seller-dashboard">
                <Header showBackButton={false} />
                <div className="dashboard-container">
                    <div className="loading">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-dashboard">
            <Header showBackButton={false} />

            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div className="container">
                    <button className="btn-back" onClick={() => navigate('/products')}>
                        <FaArrowLeft /> Back to Products
                    </button>
                    <h1>📦 Seller Dashboard</h1>
                    <p>Welcome back, {user?.username || 'Seller'}!</p>
                </div>
            </div>

            <div className="dashboard-container">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon products">
                            <FaBox />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.totalProducts}</h3>
                            <p>Total Products</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon verified">
                            <FaCheckCircle />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.verifiedProducts}</h3>
                            <p>Verified</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <FaClock />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.pendingProducts}</h3>
                            <p>Pending</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orders">
                            <FaClipboardList />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.totalOrders}</h3>
                            <p>Total Orders</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon revenue">
                            <FaDollarSign />
                        </div>
                        <div className="stat-info">
                            <h3>Rs {Math.round(stats.totalRevenue)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button 
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FaChartLine /> Overview
                    </button>
                    <button 
                        className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <FaBox /> Products
                    </button>
                    <button 
                        className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FaClipboardList /> Orders
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <div className="quick-actions">
                                <h2>Quick Actions</h2>
                                <div className="action-buttons">
                                    <button 
                                        className="action-btn add-product"
                                        onClick={() => navigate('/add-product')}
                                    >
                                        <FaPlus />
                                        <span>Add New Product</span>
                                    </button>
                                    <button 
                                        className="action-btn view-products"
                                        onClick={() => setActiveTab('products')}
                                    >
                                        <FaBox />
                                        <span>View All Products</span>
                                    </button>
                                    <button 
                                        className="action-btn view-orders"
                                        onClick={() => setActiveTab('orders')}
                                    >
                                        <FaClipboardList />
                                        <span>View Orders</span>
                                    </button>
                                </div>
                            </div>

                            <div className="recent-activity">
                                <h2>Recent Products</h2>
                                {products.length === 0 ? (
                                    <div className="empty-state">
                                        <FaBox />
                                        <p>No products yet</p>
                                        <button onClick={() => navigate('/add-product')}>
                                            Add Your First Product
                                        </button>
                                    </div>
                                ) : (
                                    <div className="products-list">
                                        {products.slice(0, 5).map(product => (
                                            <div key={product.id} className="product-row">
                                                <img 
                                                  src={getImageUrl(product.image_url, product.image)} 
                                                  alt={product.name}
                                                  onError={handleImageError}
                                                />
                                                <div className="product-details">
                                                    <h4>{product.name}</h4>
                                                    <p>Rs {Math.round(product.price)} • Stock: {product.stock}</p>
                                                </div>
                                                <span className={`badge ${product.is_validated ? 'verified' : 'pending'}`}>
                                                    {product.is_validated ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="products-section">
                            <div className="section-header">
                                <h2>My Products ({products.length})</h2>
                                <button 
                                    className="btn-add"
                                    onClick={() => navigate('/add-product')}
                                >
                                    <FaPlus /> Add Product
                                </button>
                            </div>

                            {products.length === 0 ? (
                                <div className="empty-state">
                                    <FaBox />
                                    <p>No products yet</p>
                                    <button onClick={() => navigate('/add-product')}>
                                        Add Your First Product
                                    </button>
                                </div>
                            ) : (
                                <div className="products-grid">
                                    {products.map(product => (
                                        <div key={product.id} className="product-card">
                                            <div className="product-image">
                                                <img 
                                                    src={getImageUrl(product.image_url, product.image)} 
                                                    alt={product.name}
                                                    onClick={() => navigate(`/product/${product.id}`)}
                                                    onError={handleImageError}
                                                />
                                                <span className={`status-badge ${product.is_validated ? 'verified' : 'pending'}`}>
                                                    {product.is_validated ? '✓ Verified' : '⏳ Pending'}
                                                </span>
                                            </div>
                                            <div className="product-info">
                                                <h3>{product.name}</h3>
                                                <p className="price">Rs {Math.round(product.price)}</p>
                                                <p className="stock">Stock: {product.stock} units</p>
                                                <p className="category">{product.category_display}</p>
                                                <div className="product-actions">
                                                    <button 
                                                        className="btn-icon view"
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button 
                                                        className="btn-icon edit"
                                                        onClick={() => navigate(`/add-product?edit=${product.id}`)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        className="btn-icon delete"
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="orders-section">
                            <h2>Order History ({orders.length})</h2>
                            
                            {orders.length === 0 ? (
                                <div className="empty-state">
                                    <FaClipboardList />
                                    <p>No orders yet</p>
                                </div>
                            ) : (
                                <div className="orders-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>#{order.id}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td>{order.items?.length || 0} items</td>
                                                    <td>Rs {Math.round(order.total_amount)}</td>
                                                    <td>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                            className={`status-select ${order.status}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <span className={`payment-pill ${order.payment_status}`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
