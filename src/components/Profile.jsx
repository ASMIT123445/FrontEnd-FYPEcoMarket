import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUser, FaEdit, FaSave, FaTimes, FaMapMarkerAlt,
    FaHome, FaLeaf, FaShieldAlt, FaStore,
    FaIdBadge, FaHistory, FaCheckCircle, FaClock, FaEnvelope, FaAt, FaCamera,
    FaBuilding, FaPhone, FaUniversity, FaFileAlt
} from 'react-icons/fa';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';
import axiosInstance from '../services/axiosInstance';
import Footer from './Footer';

const C = {
    bg: '#f5f6fa',
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    border: '#e8ecf0',
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryGlow: 'rgba(46,125,50,0.08)',
    text: '#1a1a2e',
    textMuted: '#64748b',
    textFaint: '#94a3b8',
    accent: '#1565c0',
    warning: '#e65100',
    danger: '#c62828',
    gold: '#f59e0b',
};

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ text: '', type: '' });
    const [greenPoints, setGreenPoints] = useState(0);
    const [topPoints, setTopPoints] = useState(0);
    const [pointsHistory, setPointsHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', username: '', role: 'customer', address: ''
    });

    // Seller onboarding state
    const [onboarding, setOnboarding] = useState(null);
    const [editingOnboarding, setEditingOnboarding] = useState(false);
    const [savingOnboarding, setSavingOnboarding] = useState(false);
    const [onboardingForm, setOnboardingForm] = useState({
        business_name: '', business_type: '', business_description: '',
        store_name: '', store_category: '',
        owner_full_name: '', phone_number: '', business_address: '', province: '',
        payment_method: '', bank_account_name: '', bank_account_number: '', bank_name: '', digital_wallet_number: '',
    });

    useEffect(() => {
        const init = async () => {
            const userInfo = getUserFromToken();
            if (!userInfo) { navigate('/login'); return; }
            try {
                const res = await fetch('http://127.0.0.1:8000/api/profile/', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setAvatarPreview(data.profile_picture || null);
                    setFormData({
                        first_name: data.first_name || '', last_name: data.last_name || '',
                        email: data.email || '', username: data.username || '',
                        role: data.role || 'customer', address: data.address || ''
                    });
                    try {
                        const pts = await axiosInstance.get('/auth/green-points/');
                        setGreenPoints(pts.data.balance || 0);
                        const lb = await axiosInstance.get('/auth/green-points/leaderboard/');
                        const top = lb.data.leaderboard?.[0]?.green_points || 0;
                        setTopPoints(top);
                    } catch {}

                    // Fetch seller onboarding data if seller
                    if (data.role === 'seller') {
                        try {
                            const ob = await axiosInstance.get('/auth/seller/onboarding/1/');
                            setOnboarding(ob.data);
                            setOnboardingForm({
                                business_name: ob.data.business_name || '',
                                business_type: ob.data.business_type || '',
                                business_description: ob.data.business_description || '',
                                store_name: ob.data.store_name || '',
                                store_category: ob.data.store_category || '',
                                owner_full_name: ob.data.owner_full_name || '',
                                phone_number: ob.data.phone_number || '',
                                business_address: ob.data.business_address || '',
                                province: ob.data.province || '',
                                payment_method: ob.data.payment_method || '',
                                bank_account_name: ob.data.bank_account_name || '',
                                bank_account_number: ob.data.bank_account_number || '',
                                bank_name: ob.data.bank_name || '',
                                digital_wallet_number: ob.data.digital_wallet_number || '',
                            });
                        } catch {}
                    }
                }
            } catch {}
            finally { setLoading(false); }
        };
        init();
    }, [navigate]);

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get('/auth/green-points/history/');
            setPointsHistory(res.data || []);
            setShowHistory(true);
        } catch {}
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Show local preview immediately
        setAvatarPreview(URL.createObjectURL(file));
        // Upload to backend
        const form = new FormData();
        form.append('profile_picture', file);
        try {
            const res = await axiosInstance.post('/auth/profile-picture/', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data.profile);
            notify('Profile picture updated!', 'success');
        } catch {
            notify('Failed to upload picture', 'error');
        }
    };

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/profile/', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.profile);
                setEditing(false);
                notify('Profile updated!', 'success');
            } else {
                const err = await res.json();
                notify(err.error || 'Update failed', 'error');
            }
        } catch { notify('Update failed', 'error'); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user.first_name || '', last_name: user.last_name || '',
            email: user.email || '', username: user.username || '',
            role: user.role || 'customer', address: user.address || ''
        });
        setEditing(false);
    };

    const handleOnboardingChange = (e) =>
        setOnboardingForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleOnboardingSave = async () => {
        setSavingOnboarding(true);
        try {
            const res = await axiosInstance.post('/auth/seller/onboarding/1/', onboardingForm);
            notify('Business info updated!', 'success');
            setOnboarding(prev => ({ ...prev, ...onboardingForm }));
            setEditingOnboarding(false);
        } catch {
            notify('Failed to update business info', 'error');
        } finally {
            setSavingOnboarding(false);
        }
    };

    const handleOnboardingCancel = () => {
        setOnboardingForm({
            business_name: onboarding?.business_name || '',
            business_type: onboarding?.business_type || '',
            business_description: onboarding?.business_description || '',
            store_name: onboarding?.store_name || '',
            store_category: onboarding?.store_category || '',
            owner_full_name: onboarding?.owner_full_name || '',
            phone_number: onboarding?.phone_number || '',
            business_address: onboarding?.business_address || '',
            province: onboarding?.province || '',
            payment_method: onboarding?.payment_method || '',
            bank_account_name: onboarding?.bank_account_name || '',
            bank_account_number: onboarding?.bank_account_number || '',
            bank_name: onboarding?.bank_name || '',
            digital_wallet_number: onboarding?.digital_wallet_number || '',
        });
        setEditingOnboarding(false);
    };

    const notify = (text, type) => {
        setToast({ text, type });
        setTimeout(() => setToast({ text: '', type: '' }), 3000);
    };

    const initials = user
        ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
        : 'U';

    if (loading) return (
        <div style={{ background: C.bg, minHeight: '100vh' }}>
            <Header showBackButton={false} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 44, height: 44, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: C.textMuted }}>Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
            <Header showBackButton={false} />

            {/* Toast */}
            {toast.text && (
                <div style={{ position: 'fixed', top: 80, right: 24, background: toast.type === 'error' ? C.danger : C.primary, color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: '0.88rem' }}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.text}
                </div>
            )}

            {/* Top Banner */}
            <div style={{ background: `linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)`, borderBottom: `1px solid #1B5E20`, padding: '20px 0 70px' }}>
                <div style={{ width: '92%', maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => navigate('/main')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600 }}>
                        <FaHome /> Home
                    </button>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>/</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem' }}>Profile</span>
                </div>
            </div>

            {/* Main Layout */}
            <div style={{ width: '92%', maxWidth: 1100, margin: '-50px auto 60px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

                {/* ===== LEFT COLUMN ===== */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Avatar Card */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 16px' }}>
                            <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: 'white', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 4px ${C.bg}, 0 0 0 6px ${C.primary}`, overflow: 'hidden' }}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : initials
                                }
                            </div>
                            {/* Camera button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                title="Change profile picture"
                                style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: C.primary, border: `2px solid ${C.bg}`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem' }}
                            >
                                <FaCamera />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 700, color: C.text }}>
                            {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                        </h2>
                        <p style={{ margin: '0 0 16px', color: C.textMuted, fontSize: '0.82rem' }}>@{user?.username}</p>

                        {/* Role */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', marginBottom: 10, background: user?.role === 'seller' ? 'rgba(59,130,246,0.15)' : C.primaryGlow, color: user?.role === 'seller' ? C.accent : C.primary, border: `1px solid ${user?.role === 'seller' ? 'rgba(59,130,246,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                            {user?.role === 'seller' ? <FaStore /> : <FaUser />}
                            {user?.role === 'seller' ? 'Seller' : 'Customer'}
                        </div>

                        {/* Verification */}
                        {user?.role === 'seller' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, fontWeight: 600, fontSize: '0.78rem', marginBottom: 14, background: user?.is_verified ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: user?.is_verified ? C.primary : C.warning, border: `1px solid ${user?.is_verified ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                                {user?.is_verified ? <FaCheckCircle /> : <FaClock />}
                                {user?.is_verified ? 'Verified Seller' : 'Pending Verification'}
                            </div>
                        )}

                        <div style={{ borderTop: `1px solid ${C.border}`, margin: '16px 0' }} />

                        {/* Edit / Save buttons */}
                        {!editing ? (
                            <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '11px', background: C.primaryGlow, color: C.primary, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.9rem' }}>
                                <FaEdit /> Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', background: C.primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem' }}>
                                    <FaSave /> {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={handleCancel} style={{ flex: 1, padding: '10px', background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem' }}>
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px' }}>
                        <p style={{ margin: '0 0 14px', fontSize: '0.75rem', fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Quick Stats</p>
                        {[
                            { label: 'Account Type', value: user?.role === 'seller' ? '🏪 Seller' : '🛍️ Customer' },
                            { label: 'Green Points', value: `🌿 ${greenPoints} pts`, highlight: true },
                            { label: 'Status', value: user?.role === 'seller' ? (user?.is_verified ? '✅ Active' : '⏳ Pending') : '✅ Active' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: '0.82rem', color: C.textMuted }}>{item.label}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.highlight ? C.primary : C.text }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ===== RIGHT COLUMN ===== */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Personal Info Card */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px' }}>
                        <h3 style={{ margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 10, color: C.text, fontSize: '1rem', fontWeight: 700, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ background: C.primaryGlow, color: C.primary, padding: '6px 8px', borderRadius: 8 }}><FaIdBadge /></span>
                            Personal Information
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
                            {[
                                { label: 'First Name', name: 'first_name', icon: <FaUser />, type: 'text' },
                                { label: 'Last Name', name: 'last_name', icon: <FaUser />, type: 'text' },
                                { label: 'Username', name: 'username', icon: <FaAt />, type: 'text' },
                                { label: 'Email', name: 'email', icon: <FaEnvelope />, type: 'email' },
                            ].map(({ label, name, icon, type }) => (
                                <div key={name}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
                                        <span style={{ color: C.primary }}>{icon}</span> {label}
                                    </label>
                                    {editing ? (
                                        <input type={type} name={name} value={formData[name]} onChange={handleChange}
                                            style={{ width: '100%', padding: '11px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                            placeholder={`Enter ${label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <div style={{ padding: '11px 14px', background: C.bg, borderRadius: 10, fontSize: '0.92rem', color: user?.[name] ? C.text : C.textFaint, border: `1px solid ${C.border}` }}>
                                            {user?.[name] || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Address — full width */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
                                    <span style={{ color: C.primary }}><FaMapMarkerAlt /></span> Address
                                </label>
                                {editing ? (
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                                        style={{ width: '100%', padding: '11px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: '0.92rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                        placeholder="Enter your shipping address"
                                    />
                                ) : (
                                    <div style={{ padding: '11px 14px', background: C.bg, borderRadius: 10, fontSize: '0.92rem', color: user?.address ? C.text : C.textFaint, border: `1px solid ${C.border}`, lineHeight: 1.6 }}>
                                        {user?.address || 'Not provided'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Details + Green Points — side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Account Details */}
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10, color: C.text, fontSize: '0.95rem', fontWeight: 700, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                                <span style={{ background: 'rgba(59,130,246,0.15)', color: C.accent, padding: '6px 8px', borderRadius: 8 }}><FaShieldAlt /></span>
                                Account Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { label: 'Account Type', value: user?.role === 'seller' ? '🏪 Seller' : '🛍️ Customer' },
                                    { label: 'Status', value: user?.role === 'seller' ? (user?.is_verified ? '✅ Verified' : '⏳ Pending') : '✅ Active' },
                                    { label: 'Platform', value: '🌿 Ecomarket' },
                                ].map(item => (
                                    <div key={item.label} style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: C.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: C.text }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Green Points */}
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10, color: C.text, fontSize: '0.95rem', fontWeight: 700, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                                <span style={{ background: C.primaryGlow, color: C.primary, padding: '6px 8px', borderRadius: 8 }}><FaLeaf /></span>
                                Green Points
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: C.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</p>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: C.primary }}>🌿 {greenPoints} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textMuted }}>pts</span></p>
                                </div>
                                <div style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                                    <p style={{ margin: '0 0 8px', fontSize: '0.7rem', color: C.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progress</p>
                                    <div style={{ background: C.border, borderRadius: 6, height: 8, overflow: 'hidden' }}>
                                        <div style={{ background: C.primary, height: '100%', borderRadius: 6, width: `${topPoints > 0 ? Math.min((greenPoints / topPoints) * 100, 100) : 0}%`, transition: 'width 0.5s' }} />
                                    </div>
                                </div>
                                <button onClick={fetchHistory} style={{ padding: '10px', background: C.primaryGlow, color: C.primary, border: `1px solid rgba(34,197,94,0.25)`, borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.82rem' }}>
                                    <FaHistory /> View History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== SELLER BUSINESS INFO CARD ===== */}
            {user?.role === 'seller' && (
                <div style={{ width: '92%', maxWidth: 1100, margin: '0 auto 40px' }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px' }}>
                        {/* Card header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: C.text, fontSize: '1rem', fontWeight: 700 }}>
                                <span style={{ background: 'rgba(59,130,246,0.12)', color: C.accent, padding: '6px 8px', borderRadius: 8 }}><FaBuilding /></span>
                                Business Information
                            </h3>
                            {!editingOnboarding ? (
                                <button onClick={() => setEditingOnboarding(true)}
                                    style={{ padding: '8px 18px', background: C.primaryGlow, color: C.primary, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem' }}>
                                    <FaEdit /> Edit
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleOnboardingSave} disabled={savingOnboarding}
                                        style={{ padding: '8px 18px', background: C.primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem' }}>
                                        <FaSave /> {savingOnboarding ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={handleOnboardingCancel}
                                        style={{ padding: '8px 18px', background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem' }}>
                                        <FaTimes /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {onboarding === null ? (
                            <p style={{ color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>
                                No onboarding data found.{' '}
                                <a href="/seller/onboarding" style={{ color: C.primary, fontWeight: 700 }}>Complete onboarding →</a>
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 28px' }}>
                                {[
                                    { label: 'Business Name',        name: 'business_name',         icon: <FaBuilding /> },
                                    { label: 'Business Type',        name: 'business_type',         icon: <FaBuilding /> },
                                    { label: 'Store Name',           name: 'store_name',            icon: <FaStore /> },
                                    { label: 'Store Category',       name: 'store_category',        icon: <FaStore /> },
                                    { label: 'Owner Full Name',      name: 'owner_full_name',       icon: <FaUser /> },
                                    { label: 'Phone Number',         name: 'phone_number',          icon: <FaPhone /> },
                                    { label: 'Province',             name: 'province',              icon: <FaMapMarkerAlt /> },
                                    { label: 'Payment Method',       name: 'payment_method',        icon: <FaUniversity /> },
                                    { label: 'Bank Name',            name: 'bank_name',             icon: <FaUniversity /> },
                                    { label: 'Bank Account Name',    name: 'bank_account_name',     icon: <FaUniversity /> },
                                    { label: 'Bank Account Number',  name: 'bank_account_number',   icon: <FaUniversity /> },
                                    { label: 'Digital Wallet No.',   name: 'digital_wallet_number', icon: <FaUniversity /> },
                                ].map(({ label, name, icon }) => (
                                    <div key={name}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
                                            <span style={{ color: C.accent }}>{icon}</span> {label}
                                        </label>
                                        {editingOnboarding ? (
                                            <input type="text" name={name} value={onboardingForm[name]} onChange={handleOnboardingChange}
                                                style={{ width: '100%', padding: '10px 13px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                                placeholder={`Enter ${label.toLowerCase()}`}
                                            />
                                        ) : (
                                            <div style={{ padding: '10px 13px', background: C.bg, borderRadius: 10, fontSize: '0.9rem', color: onboarding?.[name] ? C.text : C.textFaint, border: `1px solid ${C.border}` }}>
                                                {onboarding?.[name] || 'Not provided'}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Business Address — full width */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
                                        <span style={{ color: C.accent }}><FaMapMarkerAlt /></span> Business Address
                                    </label>
                                    {editingOnboarding ? (
                                        <textarea name="business_address" value={onboardingForm.business_address} onChange={handleOnboardingChange} rows={2}
                                            style={{ width: '100%', padding: '10px 13px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                            placeholder="Enter business address"
                                        />
                                    ) : (
                                        <div style={{ padding: '10px 13px', background: C.bg, borderRadius: 10, fontSize: '0.9rem', color: onboarding?.business_address ? C.text : C.textFaint, border: `1px solid ${C.border}`, lineHeight: 1.6 }}>
                                            {onboarding?.business_address || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                {/* Business Description — full width */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 700, color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
                                        <span style={{ color: C.accent }}><FaFileAlt /></span> Business Description
                                    </label>
                                    {editingOnboarding ? (
                                        <textarea name="business_description" value={onboardingForm.business_description} onChange={handleOnboardingChange} rows={3}
                                            style={{ width: '100%', padding: '10px 13px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                            placeholder="Describe your business"
                                        />
                                    ) : (
                                        <div style={{ padding: '10px 13px', background: C.bg, borderRadius: 10, fontSize: '0.9rem', color: onboarding?.business_description ? C.text : C.textFaint, border: `1px solid ${C.border}`, lineHeight: 1.6 }}>
                                            {onboarding?.business_description || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Points History Modal */}
            {showHistory && (
                <div onClick={() => setShowHistory(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, backdropFilter: 'blur(6px)' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, width: '90%', maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                            <h3 style={{ margin: 0, color: C.text, fontSize: '1rem' }}>🌿 Points History</h3>
                            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '1.1rem', padding: '4px 8px' }}>✕</button>
                        </div>
                        <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
                            {pointsHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}>
                                    <p style={{ fontSize: '2rem' }}>🌱</p>
                                    <p>No transactions yet. Start shopping!</p>
                                </div>
                            ) : pointsHistory.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.transaction_type === 'earned' ? C.primaryGlow : 'rgba(245,158,11,0.15)', color: t.transaction_type === 'earned' ? C.primary : C.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                                        {t.transaction_type === 'earned' ? '↑' : '↓'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 3px', fontSize: '0.85rem', color: C.text, fontWeight: 500 }}>{t.description}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: C.textMuted }}>{new Date(t.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: t.transaction_type === 'earned' ? C.primary : C.warning }}>
                                        {t.transaction_type === 'earned' ? '+' : ''}{t.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Profile;
