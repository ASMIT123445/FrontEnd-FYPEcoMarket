import { useState, useEffect, useRef } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';
import { getUserFromToken } from '../utils/auth';

/**
 * Messenger-style floating chat popup.
 * Props:
 *   orderId   - the order ID
 *   sellerId  - the seller user ID to chat with
 *   sellerName - display name for the seller
 *   onClose   - callback to close/hide the widget
 */
const ChatWidget = ({ orderId, sellerId, sellerName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = getUserFromToken();

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(`/chat/${orderId}/${sellerId}/`);
      setMessages(res.data.messages || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId, sellerId]);

  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !imageFile) return;

    const text = input.trim();
    const file = imageFile;
    setInput('');
    clearImage();

    try {
      const form = new FormData();
      if (text) form.append('content', text);
      if (file) form.append('image', file);

      const res = await axiosInstance.post(
        `/chat/${orderId}/${sellerId}/send/`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessages(prev => [...prev, res.data]);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send';
      setError(msg);
      // restore on failure
      setInput(text);
    }
  };

  return (
    <div style={S.wrapper}>
      {/* Header bar */}
      <div style={S.header} onClick={() => setMinimized(m => !m)}>
        <div style={S.headerLeft}>
          <div style={S.avatar}>{sellerName?.[0]?.toUpperCase() || 'S'}</div>
          <div>
            <div style={S.headerName}>{sellerName}</div>
            <div style={S.headerSub}>Order #{orderId}</div>
          </div>
        </div>
        <div style={S.headerActions}>
          <span style={S.iconBtn}>{minimized ? '▲' : '▼'}</span>
          <span style={S.iconBtn} onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</span>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div style={S.body}>
            {loading && <p style={S.hint}>Loading...</p>}
            {error && <p style={{ ...S.hint, color: '#e53935' }}>{error}</p>}
            {!loading && !error && messages.length === 0 && (
              <p style={S.hint}>No messages yet. Say hi! 👋</p>
            )}
            {messages.map(msg => {
              const mine = msg.sender_name === currentUser?.username;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '6px' }}>
                  <div style={{ maxWidth: '80%' }}>
                    {!mine && <div style={S.senderName}>{msg.sender_name}</div>}
                    <div style={{ ...S.bubble, ...(mine ? S.mine : S.theirs) }}>
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="attachment"
                          style={S.msgImage}
                          onClick={() => window.open(msg.image_url, '_blank')}
                        />
                      )}
                      {msg.content && <span>{msg.content}</span>}
                    </div>
                    <div style={{ ...S.time, textAlign: mine ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview strip */}
          {imagePreview && (
            <div style={S.previewStrip}>
              <div style={S.previewThumb}>
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} />
                <button style={S.removePreview} onClick={clearImage}><FaTimes /></button>
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} style={S.inputRow}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              style={S.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
            >
              <FaImage />
            </button>
            <input
              style={S.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Aa"
              autoFocus
            />
            <button type="submit" style={S.sendBtn} disabled={!input.trim() && !imageFile}>➤</button>
          </form>
        </>
      )}
    </div>
  );
};

const S = {
  wrapper: {
    position: 'fixed', bottom: '20px', right: '20px', width: '320px',
    background: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    fontFamily: 'inherit'
  },
  header: {
    background: '#2E7D32', color: 'white', padding: '10px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', userSelect: 'none'
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%', background: '#81C784',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '1rem'
  },
  headerName: { fontWeight: 700, fontSize: '0.95rem' },
  headerSub: { fontSize: '0.72rem', opacity: 0.8 },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  iconBtn: { cursor: 'pointer', fontSize: '0.9rem', opacity: 0.9, padding: '2px 4px' },
  body: { height: '280px', overflowY: 'auto', padding: '12px', background: '#f9f9f9' },
  hint: { textAlign: 'center', color: '#aaa', fontSize: '0.85rem', marginTop: '80px' },
  senderName: { fontSize: '0.7rem', color: '#888', marginBottom: '2px', marginLeft: '4px' },
  bubble: { padding: '8px 12px', borderRadius: '18px', fontSize: '0.9rem', lineHeight: 1.4, wordBreak: 'break-word', display: 'flex', flexDirection: 'column', gap: '5px' },
  mine: { background: '#2E7D32', color: 'white', borderBottomRightRadius: '4px' },
  theirs: { background: '#e4e6eb', color: '#333', borderBottomLeftRadius: '4px' },
  msgImage: { maxWidth: '180px', maxHeight: '160px', borderRadius: '8px', cursor: 'pointer', display: 'block' },
  time: { fontSize: '0.65rem', color: '#bbb', margin: '2px 4px 0' },
  previewStrip: { padding: '6px 10px', borderTop: '1px solid #eee', background: '#fafafa' },
  previewThumb: { position: 'relative', width: '50px', height: '50px', display: 'inline-block' },
  removePreview: { position: 'absolute', top: -5, right: -5, background: '#e53935', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  inputRow: { display: 'flex', gap: '5px', padding: '8px 10px', borderTop: '1px solid #eee', background: 'white', alignItems: 'center' },
  attachBtn: { background: '#f0f2f5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  input: {
    flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '20px',
    fontSize: '0.9rem', outline: 'none', background: '#f0f2f5'
  },
  sendBtn: {
    background: '#2E7D32', color: 'white', border: 'none', borderRadius: '50%',
    width: '34px', height: '34px', cursor: 'pointer', fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
};

export default ChatWidget;
