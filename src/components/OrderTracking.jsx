import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import Header from './Header';
import '../styles/OrderTracking.css';

const STEPS = [
  { key: 'pending',    label: 'Order Placed',     emoji: '🛒' },
  { key: 'confirmed',  label: 'Confirmed',         emoji: '✅' },
  { key: 'processing', label: 'Processing',        emoji: '📦' },
  { key: 'shipped',    label: 'Shipped',           emoji: '🚚' },
  { key: 'delivered',  label: 'Delivered',         emoji: '🎉' },
];

const STATUS_ORDER = STEPS.map(s => s.key);

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/track/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
        });
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setTrackingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [orderId]);

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
            <div className="info-row"><span>Ship To</span><span>{trackingData.shipping_address}</span></div>
          )}
          <div className="info-row"><span>Ordered On</span><span>{formatDate(trackingData.created_at)}</span></div>
        </div>

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
    </div>
  );
};

export default OrderTracking;
