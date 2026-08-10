import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config"; 
    FaClipboardList, FaHome, FaArrowLeft, FaDollarSign,
    FaCheckCircle, FaClock, FaTimes as FaTimesCircle
} from 'react-icons/fa';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';
import axiosInstance from '../services/axiosInstance';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import ChatWidget from './ChatWidget';
import Footer from './Footer';
import '../styles/SellerDashboard.css';
import { showToast, showConfirm } from './Toast';

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
    const [activeChat, setActiveChat] = useState(null); // { orderId, buyerName }

    useEffect(() => {
        const initUser = async () => {
            const userInfo = getUserFromToken();
            if (!userInfo) {
                navigate('/products');
                return;
            }
            
            // Fetch full profile to get role
            try {
                const response = await fetch(`${API_BASE_URL}/api/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const profileData = await response.json();
                    if (profileData.role !== 'seller') {
                        showToast('Access denied. Seller account required.', 'error');
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

            // Calculate stats — only count paid/active orders
            const verified = productsRes.data.filter(p => p.is_validated).length;
            const pending = productsRes.data.filter(p => !p.is_validated).length;

            const paidOrders = ordersRes.data.filter(o =>
                o.payment_status === 'completed' ||
                (o.payment_method === 'cod' && ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status))
            );
            const revenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.seller_subtotal ?? order.total_amount), 0);

            setStats({
                totalProducts: productsRes.data.length,
                verifiedProducts: verified,
                pendingProducts: pending,
                totalOrders: paidOrders.length,
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
        showConfirm(`Delete "${productName}"? This cannot be undone.`, async () => {
            try {
                await axiosInstance.delete(`/products/${productId}/`);
                showToast('Product deleted successfully!', 'success');
                fetchDashboardData();
            } catch (error) {
                console.error('Error deleting product:', error);
                showToast('Error deleting product', 'error');
            }
        });
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status/`, {
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
                showToast('Failed to update status', 'error');
            }
        } catch (err) {
            showToast('Error updating order status', 'error');
        }
    };

    const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payment-status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ payment_status: newPaymentStatus })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
            } else {
                showToast('Failed to update payment status', 'error');
            }
        } catch (err) {
            showToast('Error updating payment status', 'error');
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

    // ── Derive chart data from already-loaded products & orders ──
    // 1. Product status pie
    const productStatusPie = [
        { name: 'Verified', value: stats.verifiedProducts },
        { name: 'Pending',  value: stats.pendingProducts  },
    ].filter(d => d.value > 0);

    // 2. Order status bar
    const statusCounts = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    const orderStatusBar = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // 3. Monthly revenue line (last 6 months from orders)
    const now = new Date();
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthMap[key] = 0;
    }
    orders.forEach(o => {
        const isPaid = o.payment_status === 'completed' ||
            (o.payment_method === 'cod' && ['confirmed','processing','shipped','delivered'].includes(o.status));
        if (!isPaid) return;
        const d = new Date(o.created_at);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (key in monthMap) monthMap[key] += parseFloat(o.seller_subtotal ?? o.total_amount);
    });
    const revenueData = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));

    // 4. Top 5 products by stock (as a proxy for inventory focus)
    const topByStock = [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map(p => ({ name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name, stock: p.stock }));

    const PIE_COLORS = ['#2E7D32', '#FF9800'];
    const BAR_STATUS_COLORS = { pending:'#FF9800', confirmed:'#2196F3', processing:'#9C27B0', shipped:'#00BCD4', delivered:'#4CAF50', cancelled:'#f44336' };

    const chartBoxStyle = {
        background: 'white', borderRadius: '12px', padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1, minWidth: 0,
    };
    const chartTitleStyle = { color: '#1B5E20', fontSize: '1rem', fontWeight: 700, marginBottom: '14px', marginTop: 0 };

    return (
        <div className="seller-dashboard">
            <Header showBackButton={false} />

            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div className="container">
                    <button className="btn-back" onClick={() => navigate('/main')}>
                        <FaArrowLeft /> Back to Home
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

                            {/* ── 4 Charts ── */}
                            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Row 1: Revenue line + Order status bar */}
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={chartBoxStyle}>
                                        <h3 style={chartTitleStyle}>📈 Monthly Revenue (Rs)</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <LineChart data={revenueData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `Rs ${v}`} width={70} />
                                                <Tooltip formatter={v => [`Rs ${v}`, 'Revenue']} />
                                                <Line type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2.5}
                                                    dot={{ fill: '#2E7D32', r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={chartBoxStyle}>
                                        <h3 style={chartTitleStyle}>🛒 Orders by Status</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={orderStatusBar} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                    {orderStatusBar.map((entry, i) => (
                                                        <Cell key={i} fill={BAR_STATUS_COLORS[entry.status] || '#90A4AE'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Row 2: Product status pie + Top products by stock */}
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={chartBoxStyle}>
                                        <h3 style={chartTitleStyle}>📦 Product Verification Status</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={productStatusPie} cx="50%" cy="50%" outerRadius={80}
                                                    dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine>
                                                    {productStatusPie.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={chartBoxStyle}>
                                        <h3 style={chartTitleStyle}>📊 Top Products by Stock</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={topByStock} layout="vertical"
                                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                                                <Tooltip />
                                                <Bar dataKey="stock" fill="#43A047" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
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
                                    {/* Desktop table */}
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Items</th>
                                                <th>Your Total</th>
                                                <th>Order Status</th>
                                                <th>Payment Status</th>
                                                <th>Chat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <div>#{order.id}</div>
                                                        <div style={{fontSize: '0.78rem', color: '#555', marginTop: '2px'}}>{order.customer_name}</div>
                                                    </td>
                                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td>{order.items?.length || 0} items</td>
                                                    <td>Rs {Math.round(order.seller_subtotal ?? order.total_amount)}</td>
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
                                                        <select
                                                            value={order.payment_status}
                                                            onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                                                            className={`status-select ${order.payment_status}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="cash_payment">Cash Payment</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="failed">Failed</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => setActiveChat(activeChat?.orderId === order.id ? null : { orderId: order.id, buyerName: order.customer_name || `Order #${order.id}` })}
                                                            style={{ background: activeChat?.orderId === order.id ? '#1B5E20' : '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >
                                                            💬 {activeChat?.orderId === order.id ? 'Close' : 'Chat'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile card layout */}
                                    <div className="order-card-mobile">
                                        {orders.map(order => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-card-header">
                                                    <div>
                                                        <div className="order-card-id">#{order.id}</div>
                                                        <div className="order-card-customer">{order.customer_name}</div>
                                                    </div>
                                                    <div className="order-card-date">{new Date(order.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div className="order-card-row">
                                                    <label>Items</label>
                                                    <span>{order.items?.length || 0} items</span>
                                                </div>
                                                <div className="order-card-row">
                                                    <label>Your Total</label>
                                                    <span>Rs {Math.round(order.seller_subtotal ?? order.total_amount)}</span>
                                                </div>
                                                <div className="order-card-row">
                                                    <label>Order Status</label>
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
                                                </div>
                                                <div className="order-card-row">
                                                    <label>Payment</label>
                                                    <select
                                                        value={order.payment_status}
                                                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                                                        className={`status-select ${order.payment_status}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="cash_payment">Cash Payment</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="failed">Failed</option>
                                                    </select>
                                                </div>
                                                <div className="order-card-actions">
                                                    <button
                                                        className="order-card-chat-btn"
                                                        onClick={() => setActiveChat(activeChat?.orderId === order.id ? null : { orderId: order.id, buyerName: order.customer_name || `Order #${order.id}` })}
                                                    >
                                                        💬 {activeChat?.orderId === order.id ? 'Close Chat' : 'Chat'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        {/* Chat Widget for seller */}
        {activeChat && user && (
            <ChatWidget
                orderId={activeChat.orderId}
                sellerId={user.id}
                sellerName={activeChat.buyerName}
                onClose={() => setActiveChat(null)}
            />
        )}
        <Footer />
    </div>
  );
};

export default SellerDashboard;
