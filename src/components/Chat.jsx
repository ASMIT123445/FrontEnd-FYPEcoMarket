import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaComments, FaImage, FaTimes } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';

const Chat = () => {
  const { orderId, sellerId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = getUserFromToken();

  const fetchChat = async () => {
    try {
      const res = await axiosInstance.get(`/chat/${orderId}/${sellerId}/`);
      setRoom(res.data);
      setMessages(res.data.messages || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [orderId, sellerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setSending(true);
    try {
      const form = new FormData();
      if (input.trim()) form.append('content', input.trim());
      if (imageFile) form.append('image', imageFile);

      const res = await axiosInstance.post(
        `/chat/${orderId}/${sellerId}/send/`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessages(prev => [...prev, res.data]);
      setInput('');
      clearImage();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={styles.page}><Header showBackButton={false} />
      <div style={styles.center}><p>Loading chat...</p></div>
    </div>
  );

  if (error && !messages.length) return (
    <div style={styles.page}><Header showBackButton={false} />
      <div style={styles.center}>
        <p style={{ color: '#e53935' }}>{error}</p>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Header showBackButton={false} />
      <div style={styles.container}>
        <div style={styles.chatHeader}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <div style={styles.chatTitle}>
            <FaComments style={{ color: '#2E7D32', fontSize: '1.4rem' }} />
            <div>
              <h3 style={{ margin: 0, color: '#1B5E20' }}>Chat with {room?.seller_name}</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#666' }}>Order #{orderId}</p>
            </div>
          </div>
        </div>

        <div style={styles.messagesBox}>
          {messages.length === 0 && (
            <div style={styles.emptyChat}>
              <FaComments style={{ fontSize: '2rem', color: '#ccc' }} />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.sender_name === currentUser?.username;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                <div style={{ maxWidth: '70%' }}>
                  {!isMine && <p style={styles.senderName}>{msg.sender_name}</p>}
                  <div style={{ ...styles.bubble, ...(isMine ? styles.myBubble : styles.theirBubble) }}>
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="attachment"
                        style={styles.msgImage}
                        onClick={() => window.open(msg.image_url, '_blank')}
                      />
                    )}
                    {msg.content && <span>{msg.content}</span>}
                  </div>
                  <p style={{ ...styles.time, textAlign: isMine ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview strip */}
        {imagePreview && (
          <div style={styles.previewStrip}>
            <div style={styles.previewThumb}>
              <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
              <button style={styles.removePreview} onClick={clearImage}><FaTimes /></button>
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} style={styles.inputRow}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          {/* Image attach button */}
          <button
            type="button"
            style={styles.attachBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <FaImage />
          </button>
          <input
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button type="submit" style={styles.sendBtn} disabled={sending || (!input.trim() && !imageFile)}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  container: { maxWidth: '750px', margin: '80px auto 20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '15px' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', borderBottom: '1px solid #e0e0e0', background: '#f9f9f9', borderRadius: '16px 16px 0 0' },
  chatTitle: { display: 'flex', alignItems: 'center', gap: '12px' },
  backBtn: { background: 'none', border: '1px solid #2E7D32', color: '#2E7D32', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 },
  messagesBox: { flex: 1, overflowY: 'auto', padding: '20px' },
  emptyChat: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', gap: '10px' },
  senderName: { fontSize: '0.75rem', color: '#888', margin: '0 0 3px 4px' },
  bubble: { padding: '10px 14px', borderRadius: '12px', fontSize: '0.95rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' },
  myBubble: { background: '#2E7D32', color: 'white', borderBottomRightRadius: '4px' },
  theirBubble: { background: '#f0f0f0', color: '#333', borderBottomLeftRadius: '4px' },
  msgImage: { maxWidth: '220px', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer', display: 'block' },
  time: { fontSize: '0.72rem', color: '#aaa', margin: '3px 4px 0' },
  previewStrip: { padding: '8px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' },
  previewThumb: { position: 'relative', width: '60px', height: '60px', display: 'inline-block' },
  removePreview: { position: 'absolute', top: -6, right: -6, background: '#e53935', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  inputRow: { display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid #e0e0e0', alignItems: 'center' },
  attachBtn: { background: '#f0f0f0', border: 'none', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', color: '#555', fontSize: '1rem', display: 'flex', alignItems: 'center' },
  input: { flex: 1, padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' },
  sendBtn: { background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 18px', cursor: 'pointer', fontSize: '1rem' },
};

export default Chat;
