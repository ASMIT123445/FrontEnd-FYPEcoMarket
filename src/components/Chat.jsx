import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaComments } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';
import Header from './Header';
import { getUserFromToken } from '../utils/auth';

const Chat = () => {
  const { orderId, sellerId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await axiosInstance.post(`/chat/${orderId}/${sellerId}/send/`, { content: input.trim() });
      setMessages(prev => [...prev, res.data]);
      setInput('');
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

  if (error) return (
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
                    {msg.content}
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

        <form onSubmit={sendMessage} style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button type="submit" style={styles.sendBtn} disabled={sending || !input.trim()}>
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
  bubble: { padding: '10px 14px', borderRadius: '12px', fontSize: '0.95rem', lineHeight: 1.5 },
  myBubble: { background: '#2E7D32', color: 'white', borderBottomRightRadius: '4px' },
  theirBubble: { background: '#f0f0f0', color: '#333', borderBottomLeftRadius: '4px' },
  time: { fontSize: '0.72rem', color: '#aaa', margin: '3px 4px 0' },
  inputRow: { display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e0e0e0' },
  input: { flex: 1, padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' },
  sendBtn: { background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 18px', cursor: 'pointer', fontSize: '1rem' },
};

export default Chat;
