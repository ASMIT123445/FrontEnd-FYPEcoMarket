import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUser, FaEdit, FaSave, FaTimes, FaEnvelope, FaUserTag, 
    FaHome, FaChevronRight 
} from 'react-icons/fa';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';
import axiosInstance from '../services/axiosInstance';
import '../styles/ShoppingCart.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showMessage, setShowMessage] = useState('');
    const [greenPoints, setGreenPoints] = useState(0);
    const [pointsHistory, setPointsHistory] = useState([]);
    const [showPointsHistory, setShowPointsHistory] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        role: 'customer',
        address: ''
    });

    useEffect(() => {
        const initializeProfile = async () => {
            const userInfo = getUserFromToken();
            if (!userInfo) {
                navigate('/login');
                return;
            }

            try {
                // Fetch complete profile data
                const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const profileData = await response.json();
                    setUser(profileData);
                    setFormData({
                        first_name: profileData.first_name || '',
                        last_name: profileData.last_name || '',
                        email: profileData.email || '',
                        username: profileData.username || '',
                        role: profileData.role || 'customer',
                        address: profileData.address || ''
                    });
                    
                    // Fetch green points
                    await fetchGreenPoints();
                } else {
                    console.error('Error fetching profile:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeProfile();
    }, [navigate]);

    const fetchGreenPoints = async () => {
        try {
            const response = await axiosInstance.get('/auth/green-points/');
            setGreenPoints(response.data.balance || 0);
        } catch (error) {
            console.error('Error fetching green points:', error);
        }
    };

    const fetchPointsHistory = async () => {
        try {
            const response = await axiosInstance.get('/auth/green-points/history/');
            setPointsHistory(response.data || []);
            setShowPointsHistory(true);
        } catch (error) {
            console.error('Error fetching points history:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.profile);
                setEditing(false);
                displayMessage('Profile updated successfully!');
            } else {
                const errorData = await response.json();
                displayMessage(errorData.error || 'Error updating profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            displayMessage('Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            username: user.username || '',
            role: user.role || 'customer',
            address: user.address || ''
        });
        setEditing(false);
    };

    const displayMessage = (message) => {
        setShowMessage(message);
        setTimeout(() => setShowMessage(''), 3000);
    };

    if (loading) {
        return (
            <div className="shopping-cart-page">
                <Header showBackButton={false} />
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading profile...</p>
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
                        <span>Profile</span>
                    </div>
                </div>
            </div>

            {/* Message Display */}
            {showMessage && (
                <div className="message-popup">
                    {showMessage}
                </div>
            )}

            <div className="container">
                {/* Profile Information */}
                <div className="profile-container">
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <FaUser />
                            </div>
                            <div className="profile-info">
                                <h1>{user?.username || `${user?.first_name} ${user?.last_name}` || 'User'}</h1>
                                <p className="profile-role">
                                    <FaUserTag />
                                    {user?.role === 'seller' ? 'Seller' : 'Customer'}
                                </p>
                            </div>
                            <div className="profile-actions">
                                {!editing ? (
                                    <button className="btn-edit" onClick={() => setEditing(true)}>
                                        <FaEdit />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="edit-actions">
                                        <button 
                                            className="btn-save" 
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            <FaSave />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className="btn-cancel" onClick={handleCancel}>
                                            <FaTimes />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-row">
                                <label>First Name</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                    />
                                ) : (
                                    <span>{user?.first_name || 'Not provided'}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Last Name</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                    />
                                ) : (
                                    <span>{user?.last_name || 'Not provided'}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>
                                    <FaEnvelope />
                                    Email
                                </label>
                                {editing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                    />
                                ) : (
                                    <span>{user?.email || 'Not provided'}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Username</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter username"
                                    />
                                ) : (
                                    <span>{user?.username || 'Not provided'}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Role</label>
                                {editing ? (
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="seller">Seller</option>
                                    </select>
                                ) : (
                                    <span className={`role-badge ${user?.role}`}>
                                        {user?.role === 'seller' ? 'Seller' : 'Customer'}
                                    </span>
                                )}
                            </div>

                            {/* Seller verification status */}
                            {user?.role === 'seller' && (
                                <div className="detail-row">
                                    <label>Verification Status</label>
                                    {user?.is_verified === true ? (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: '#e8f5e9', color: '#2E7D32',
                                            padding: '4px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem'
                                        }}>
                                            ✅ Verified
                                        </span>
                                    ) : (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: '#fff3e0', color: '#e65100',
                                            padding: '4px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem'
                                        }}>
                                            ⏳ Unverified — Pending admin approval
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="detail-row">
                                <label>Address</label>
                                {editing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full shipping address"
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    />
                                ) : (
                                    <span>{user?.address || 'Not provided'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Green Points Section */}
                    <div className="green-points-section">
                        <div className="points-card">
                            <h3>🌿 Green Points</h3>
                            <div className="points-balance">
                                <span className="points-number">{greenPoints}</span>
                                <span className="points-label">Points</span>
                            </div>
                            <div className="points-info">
                                <p>• Earn 1 point for every Rs 10 spent</p>
                                <p>• 10 points = Rs 1 discount</p>
                            </div>
                            <button 
                                className="btn-view-history"
                                onClick={fetchPointsHistory}
                            >
                                View History
                            </button>
                        </div>
                    </div>
 
                    {/* Points History Modal */}
                    {showPointsHistory && (
                        <div className="modal-overlay" onClick={() => setShowPointsHistory(false)}>
                            <div className="points-history-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Transaction History</h3>
                                    <button 
                                        className="btn-close-modal"
                                        onClick={() => setShowPointsHistory(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="history-list">
                                    {pointsHistory.length === 0 ? (
                                        <div className="empty-history">
                                            <p>No transactions yet</p>
                                            <p style={{fontSize: '0.9rem', color: '#999'}}>
                                                Start shopping to earn points!
                                            </p>
                                        </div>
                                    ) : (
                                        pointsHistory.map(transaction => (
                                            <div key={transaction.id} className="history-item">
                                                <div className="transaction-details">
                                                    <p className="transaction-desc">{transaction.description}</p>
                                                    <p className="transaction-date">
                                                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className={`transaction-points ${transaction.transaction_type}`}>
                                                    {transaction.transaction_type === 'earned' ? '+' : ''}{transaction.points}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default Profile;