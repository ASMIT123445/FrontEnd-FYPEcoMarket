/**
 * Global Toast + Confirm Dialog system
 * Usage:
 *   showToast('Message', 'success' | 'error' | 'warning' | 'info')
 *   showConfirm('Are you sure?', onConfirm, onCancel?)
 *
 * Add <ToastContainer /> and <ConfirmDialog /> once in App.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes, FaExclamationCircle } from 'react-icons/fa';

// ─── Toast store ───────────────────────────────────────────────────────────────
let _addToast = null;

export function showToast(message, type = 'info', duration = 3500) {
    if (_addToast) {
        _addToast({ message, type, duration, id: Date.now() + Math.random() });
    }
}

const TOAST_CONFIG = {
    success: { icon: <FaCheckCircle />,          bg: '#2E7D32', border: '#1B5E20', text: '#1B5E20', light: '#e8f5e9' },
    error:   { icon: <FaTimesCircle />,           bg: '#c62828', border: '#b71c1c', text: '#b71c1c', light: '#ffebee' },
    warning: { icon: <FaExclamationTriangle />,   bg: '#e65100', border: '#bf360c', text: '#e65100', light: '#fff3e0' },
    info:    { icon: <FaInfoCircle />,            bg: '#1565c0', border: '#0d47a1', text: '#1565c0', light: '#e3f2fd' },
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const t = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: 'white',
            border: `1px solid ${cfg.border}`,
            borderLeft: `4px solid ${cfg.bg}`,
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxWidth: 380, width: '100%',
            transform: visible ? 'translateX(0)' : 'translateX(120px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
            <span style={{ color: cfg.bg, fontSize: '1.1rem', marginTop: 2, flexShrink: 0 }}>
                {cfg.icon}
            </span>
            <span style={{ flex: 1, fontSize: '0.9rem', color: '#333', lineHeight: 1.5 }}>
                {toast.message}
            </span>
            <button
                onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '0 0 0 4px', fontSize: '0.85rem', flexShrink: 0 }}
            >
                <FaTimes />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((t) => setToasts(prev => [...prev, t]), []);
    const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    useEffect(() => {
        _addToast = addToast;
        return () => { _addToast = null; };
    }, [addToast]);

    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24,
            display: 'flex', flexDirection: 'column', gap: 10,
            zIndex: 99999, pointerEvents: 'none',
        }}>
            {toasts.map(toast => (
                <div key={toast.id} style={{ pointerEvents: 'all' }}>
                    <ToastItem toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
let _showConfirm = null;

export function showConfirm(message, onConfirm, onCancel) {
    if (_showConfirm) _showConfirm({ message, onConfirm, onCancel });
}

export function ConfirmDialog() {
    const [dialog, setDialog] = useState(null);

    useEffect(() => {
        _showConfirm = (d) => setDialog(d);
        return () => { _showConfirm = null; };
    }, []);

    if (!dialog) return null;

    const handleConfirm = () => { setDialog(null); dialog.onConfirm?.(); };
    const handleCancel  = () => { setDialog(null); dialog.onCancel?.(); };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99998, backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: 'white', borderRadius: 16,
                padding: '32px 28px', maxWidth: 400, width: '90%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                textAlign: 'center',
            }}>
                {/* Icon */}
                <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: '#fff3e0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 18px',
                }}>
                    <FaExclamationCircle style={{ color: '#e65100', fontSize: '1.6rem' }} />
                </div>

                <p style={{ margin: '0 0 24px', fontSize: '1rem', color: '#333', lineHeight: 1.6, fontWeight: 500 }}>
                    {dialog.message}
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={handleCancel} style={{
                        padding: '10px 24px', borderRadius: 10,
                        border: '1px solid #e0e0e0', background: 'white',
                        color: '#555', cursor: 'pointer', fontWeight: 600,
                        fontSize: '0.9rem', minWidth: 100,
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} style={{
                        padding: '10px 24px', borderRadius: 10,
                        border: 'none', background: '#c62828',
                        color: 'white', cursor: 'pointer', fontWeight: 600,
                        fontSize: '0.9rem', minWidth: 100,
                    }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
