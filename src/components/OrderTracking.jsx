import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaBan, FaCheck  } from 'react-icons/fa';
import { TbTruckDelivery } from "react-icons/tb";

import Header from './Header';
import ChatWidget from './ChatWidget';
import '../styles/OrderTracking.css';
import Footer from './Footer';
import { showToast, showConfirm } from './Toast';

const STEPS = [
  { key: 'pending',    label: 'Order Placed',     emoji: '🛒' },
  { key: 'confirmed',  label: 'Confirmed',         emoji: <FaCheck /> },
  { key: 'processing', label: 'Processing',        emoji: '📦' },
  { key: 'shipped',    label: 'Shipped',           emoji: <TbTruckDelivery />
 },
  { key: 'delivered',  label: 'Delivered',         emoji: '🎉' },
];

const STATUS_ORDER = STEPS.map(s => s.key);


const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { sellerId, sellerName }

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/track/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        });
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setTrackingData(data);

        // Fetch sellers for this order
        try {
          const sellersRes = await fetch(`http://127.0.0.1:8000/api/chat/${orderId}/sellers/`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
          });
          if (sellersRes.ok) setSellers(await sellersRes.json());
        } catch (_) {}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [orderId]);

  const handleCancel = async () => {
    showConfirm('Are you sure you want to cancel this order?', async () => {
      setCancelling(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/cancel/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
        setTrackingData(prev => ({
          ...prev,
          current_status: 'cancelled',
          status_history: [
            { status: 'cancelled', note: 'Cancelled by customer', changed_at: new Date().toISOString() },
            ...(prev.status_history || [])
          ]
        }));
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setCancelling(false);
      }
    });
  };

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return STATUS_ORDER.indexOf(status);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  if (loading) return (
    <div className="tracking-page">
      <Header />
      <div className="tracking-loading"><div className="loading-spinner"></div><p>Loading tracking info...</p></div>
    </div>
  );

  if (error) return (
    <div className="tracking-page">
      <Header />
      <div className="tracking-error">
        <FaTimesCircle style={{ fontSize: '48px', color: '#dc3545' }} />
        <h2>{error}</h2>
        <button onClick={() => navigate('/cart')} className="btn-back">Go to Orders</button>
      </div>
    </div>
  );

  const currentIndex = getStepIndex(trackingData.current_status);
  const isCancelled = trackingData.current_status === 'cancelled';

  return (
    <div className="tracking-page">
      <Header />

      <div className="tracking-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <h2>Order Tracking</h2>
        <p className="order-id-label">Order #{trackingData.order_id}</p>

        {/* Status Stepper */}
        {isCancelled ? (
          <div className="cancelled-banner">
            <FaTimesCircle /> This order was cancelled.
          </div>
        ) : (
          <div className="stepper">
            {STEPS.map((step, idx) => {
              const done = idx < currentIndex;
              const active = idx === currentIndex;
              return (
                <div key={step.key} className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                  <div className="step-circle">
                    {done ? <FaCheckCircle /> : <span>{step.emoji}</span>}
                  </div>
                  <div className="step-label">{step.label}</div>
                  {idx < STEPS.length - 1 && (
                    <div className={`step-line ${done ? 'done' : ''}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Order Info */}
        <div className="tracking-info-card">
          <div className="info-row"><span>Status</span><span className={`status-pill ${trackingData.current_status}`}>{trackingData.current_status}</span></div>
          <div className="info-row"><span>Payment</span><span>{trackingData.payment_method?.toUpperCase()} — {trackingData.payment_status}</span></div>
          <div className="info-row"><span>Total</span><span>Rs {Math.round(trackingData.total_amount)}</span></div>
          {trackingData.shipping_address && (
            <div className="info-row"><span>Deliver To</span><span>{trackingData.shipping_address}</span></div>
          )}
          <div className="info-row"><span>Ordered On</span><span>{formatDate(trackingData.created_at)}</span></div>
        </div>

        {/* Cancel Order Button */}
        {['pending', 'confirmed'].includes(trackingData.current_status) && (
          <button
            className="btn-cancel-order"
            onClick={handleCancel}
            disabled={cancelling}
          >
            <FaBan /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        {/* Chat with Sellers */}
        {sellers.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontWeight: 600, color: '#1B5E20', marginBottom: '8px' }}>💬 Chat with Seller{sellers.length > 1 ? 's' : ''}:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sellers.map(seller => (
                <button
                  key={seller.id}
                  style={{ padding: '10px 16px', background: activeChat?.sellerId === seller.id ? '#1B5E20' : '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
                  onClick={() => setActiveChat(activeChat?.sellerId === seller.id ? null : { sellerId: seller.id, sellerName: seller.username })}
                >
                  💬 {activeChat?.sellerId === seller.id ? 'Close chat with' : 'Chat with'} {seller.username}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Widget */}
        {activeChat && (
          <ChatWidget
            orderId={orderId}
            sellerId={activeChat.sellerId}
            sellerName={activeChat.sellerName}
            onClose={() => setActiveChat(null)}
          />
        )}

        {/* Status History Timeline */}
        {trackingData.status_history?.length > 0 && (
          <div className="history-timeline">
            <h3>Status History</h3>
            {trackingData.status_history.map((entry, idx) => (
              <div key={idx} className="timeline-entry">
                <FaClock className="timeline-icon" />
                <div>
                  <span className={`status-pill ${entry.status}`}>{entry.status}</span>
                  {entry.note && <p className="timeline-note">{entry.note}</p>}
                  <p className="timeline-date">{formatDate(entry.changed_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;
