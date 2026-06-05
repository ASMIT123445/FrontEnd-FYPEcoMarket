import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getUserFromToken } from '../utils/auth';
import { showToast, showConfirm } from './Toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PAGE_SIZE = 15;

// ── Pagination helper ──────────────────────────────────────────
function usePage(data) {
  const [page, setPage] = useState(1);
  // reset to page 1 whenever the underlying data changes
  useEffect(() => { setPage(1); }, [data]);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const slice = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { slice, page, setPage, totalPages, total: data.length };
}

function Pagination({ page, totalPages, total, setPage }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div style={PS.wrap}>
      <span style={PS.info}>
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </span>
      <div style={PS.controls}>
        <button style={{ ...PS.btn, opacity: page === 1 ? 0.35 : 1 }}
          disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
        {pages.map(p => (
          <button key={p}
            style={{ ...PS.btn, ...(p === page ? PS.active : {}) }}
            onClick={() => setPage(p)}>{p}</button>
        ))}
        <button style={{ ...PS.btn, opacity: page === totalPages ? 0.35 : 1 }}
          disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
      </div>
    </div>
  );
}

const PS = {
  wrap: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', background: 'white', borderTop: '1px solid #f0f0f0',
    borderRadius: '0 0 10px 10px', marginTop: -1 },
  info: { fontSize: '0.82rem', color: '#888' },
  controls: { display: 'flex', gap: 4 },
  btn: { minWidth: 32, height: 32, border: '1px solid #e0e0e0', borderRadius: 6,
    background: 'white', cursor: 'pointer', fontSize: '0.85rem', color: '#333',
    transition: 'all 0.15s' },
  active: { background: '#2E7D32', color: 'white', borderColor: '#2E7D32', fontWeight: 700 },
};
// ──────────────────────────────────────────────────────────────

const TABS = ['Dashboard', 'Users', 'Customers', 'Sellers', 'Products', 'Orders', 'Ratings', 'Categories'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSeller, setExpandedSeller] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [ecoCategories, setEcoCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('Eco');

  const [isReady, setIsReady] = useState(false);
  const [chartData, setChartData] = useState(null);

  // ── per-tab pagination ──
  const usersPag     = usePage(users);
  const customersPag = usePage(customers);
  const sellersPag   = usePage(sellers);
  const productsPag  = usePage(products);
  const ordersPag    = usePage(orders);
  const ratingsPag   = usePage(ratings);
  const categoriesPag = usePage(categories);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) { navigate('/admin-login'); return; }
    // Fast path: is_staff already in token
    if (user.is_staff) { setIsReady(true); return; }
    // Fallback: check via profile API
    axiosInstance.get('/profile/').then(r => {
      if (!r.data.is_staff) { navigate('/admin-login'); }
      else setIsReady(true);
    }).catch(() => navigate('/admin-login'));
  }, []);

  useEffect(() => {
    if (!isReady) return; // wait for auth confirmation before loading data
    if (tab === 'Dashboard') fetchStats();
    else if (tab === 'Users') fetchUsers();
    else if (tab === 'Customers') fetchCustomers();
    else if (tab === 'Sellers') fetchSellers();
    else if (tab === 'Products') { fetchProducts(); fetchCategories(); }
    else if (tab === 'Orders') fetchOrders();
    else if (tab === 'Ratings') fetchRatings();
    else if (tab === 'Categories') fetchCategories();
  }, [tab, isReady]);

  const fetchStats = async () => {
    const r = await axiosInstance.get('/admin-panel/stats/');
    setStats(r.data);
    // fetch chart data alongside stats
    try {
      const c = await axiosInstance.get('/admin-panel/charts/');
      setChartData(c.data);
    } catch (e) {
      console.error('Chart data fetch failed', e);
    }
  };
  const fetchUsers = async () => { const r = await axiosInstance.get('/admin-panel/users/'); setUsers(r.data); };
  const fetchCustomers = async () => { const r = await axiosInstance.get('/admin-panel/customers/'); setCustomers(r.data); };
  const fetchSellers = async () => { const r = await axiosInstance.get('/admin-panel/sellers/'); setSellers(r.data); };
  const fetchProducts = async () => { const r = await axiosInstance.get('/admin-panel/products/'); setProducts(r.data); };
  const fetchOrders = async () => { const r = await axiosInstance.get('/admin-panel/orders/'); setOrders(r.data); };
  const fetchRatings = async () => { const r = await axiosInstance.get('/admin-panel/ratings/'); setRatings(r.data); };
  const fetchCategories = async () => {
    const r = await axiosInstance.get('/admin-panel/categories/');
    setCategories(r.data);
    setEcoCategories(r.data.filter(c => c.type === 'Eco'));
    setProductCategories(r.data.filter(c => c.type === 'Product'));
  };

  const notify = (m) => showToast(m, 'success');

  const deleteUser = async (id) => {
    showConfirm('Delete this user?', async () => {
      await axiosInstance.delete(`/admin-panel/users/${id}/`);
      notify('User deleted'); fetchUsers();
    });
  };

  const toggleSeller = async (id, current) => {
    await axiosInstance.patch(`/admin-panel/sellers/${id}/`, { is_validated: !current });
    notify(current ? 'Seller unverified' : 'Seller verified'); fetchSellers();
  };

  const deleteSeller = async (id) => {
    showConfirm('Delete this seller?', async () => {
      await axiosInstance.delete(`/admin-panel/sellers/${id}/`);
      notify('Seller deleted'); fetchSellers();
    });
  };

  const toggleProduct = async (id, current) => {
    await axiosInstance.patch(`/admin-panel/products/${id}/`, { is_validated: !current });
    notify(current ? 'Product unverified' : 'Product verified'); fetchProducts();
  };

  const deleteProduct = async (id) => {
    showConfirm('Delete this product?', async () => {
      await axiosInstance.delete(`/admin-panel/products/${id}/`);
      notify('Product deleted'); fetchProducts();
    });
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    await axiosInstance.patch(`/admin-panel/products/${editingProduct.id}/`, {
      name: editingProduct.name,
      price: editingProduct.price,
      stock: editingProduct.stock,
      description: editingProduct.description,
      eco_category_id: editingProduct.eco_category_id,
      product_category_id: editingProduct.product_category_id,
    });
    notify('Product saved'); setEditingProduct(null); fetchProducts();
  };

  const updateOrderStatus = async (id, status) => {
    await axiosInstance.patch(`/admin-panel/orders/${id}/`, { status });
    notify('Order updated'); fetchOrders();
  };

  const deleteOrder = async (id) => {
    showConfirm('Delete this order?', async () => {
      await axiosInstance.delete(`/admin-panel/orders/${id}/`);
      notify('Order deleted'); fetchOrders();
    });
  };

  const deleteCustomer = async (id) => {
    showConfirm('Delete this customer?', async () => {
      await axiosInstance.delete(`/admin-panel/customers/${id}/`);
      notify('Customer deleted'); fetchCustomers();
    });
  };

  const deleteRating = async (id) => {
    showConfirm('Delete this rating?', async () => {
      await axiosInstance.delete(`/admin-panel/ratings/${id}/`);
      notify('Rating deleted'); fetchRatings();
    });
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await axiosInstance.post('/admin-panel/categories/', { name: newCatName, type: newCatType });
    notify('Category added'); setNewCatName(''); fetchCategories();
  };

  const deleteCategory = async (type, id) => {
    showConfirm('Delete this category?', async () => {
      await axiosInstance.delete(`/admin-panel/categories/${type}/${id}/`);
      notify('Category deleted'); fetchCategories();
    });
  };

  return (
    <div style={S.page}>
      {!isReady && (
        <div style={{ position: 'fixed', inset: 0, background: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', zIndex: 9999 }}>
          🌿 Loading Admin Panel...
        </div>
      )}
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.logo}>🌿 Ecomarket<br/><span style={{fontSize:'0.75rem', opacity:0.7}}>Admin Panel</span></div>
        {TABS.map(t => (
          <button key={t} style={{ ...S.navBtn, ...(tab === t ? S.navActive : {}) }} onClick={() => setTab(t)}>
            {t === 'Dashboard' ? '📊' : t === 'Users' ? '👥' : t === 'Customers' ? '🛍️' : t === 'Sellers' ? '🏪' : t === 'Products' ? '📦' : t === 'Orders' ? '🛒' : t === 'Ratings' ? '⭐' : '🏷️'} {t}
          </button>
        ))}
        <button style={{ ...S.navBtn, marginTop: 'auto', color: '#ff6b6b' }} onClick={() => { localStorage.clear(); navigate('/admin-login'); }}>
          🚪 Logout
        </button>
      </div>

      {/* Main */}
      <div style={S.main}>
        <h2 style={S.heading}>{tab}</h2>

        {/* DASHBOARD */}
        {tab === 'Dashboard' && stats && (
          <div>
            {/* ── Stat Cards ── */}
            <div style={S.grid}>
              {[
                { label: 'Total Users',       value: stats.total_users,                        color: '#4CAF50', icon: '👥' },
                { label: 'Total Sellers',     value: stats.total_sellers,                      color: '#2196F3', icon: '🏪' },
                { label: 'Pending Sellers',   value: stats.pending_sellers,                    color: '#FF9800', icon: '⏳' },
                { label: 'Total Products',    value: stats.total_products,                     color: '#9C27B0', icon: '📦' },
                { label: 'Pending Products',  value: stats.pending_products,                   color: '#f44336', icon: '🔍' },
                { label: 'Total Orders',      value: stats.total_orders,                       color: '#00BCD4', icon: '🛒' },
                { label: 'Total Revenue',     value: `Rs ${Math.round(stats.total_revenue)}`,  color: '#4CAF50', icon: '💰' },
              ].map(c => (
                <div key={c.label} style={{ ...S.card, borderTop: `4px solid ${c.color}` }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{c.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* ── Charts (4 figures) ── */}
            {chartData && (
              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Row 1: Revenue line + Orders bar */}
                <div style={S.chartRow}>
                  <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>📈 Monthly Revenue (Rs)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData.monthly_revenue} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `Rs ${v}`} />
                        <Tooltip formatter={v => [`Rs ${Math.round(v)}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2.5}
                          dot={{ fill: '#2E7D32', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>📦 Monthly Orders</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData.monthly_orders} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#1565c0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Row 2: Seller pie + Product pie */}
                <div style={S.chartRow}>
                  <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>🏪 Seller Verification Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={chartData.seller_pie} cx="50%" cy="50%" outerRadius={85}
                          dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine>
                          <Cell fill="#2E7D32" />
                          <Cell fill="#FF9800" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={S.chartBox}>
                    <h3 style={S.chartTitle}>📦 Product Verification Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={chartData.product_pie} cx="50%" cy="50%" outerRadius={85}
                          dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine>
                          <Cell fill="#4CAF50" />
                          <Cell fill="#f44336" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === 'Users' && (
          <>
          <table style={S.table}>
            <thead><tr>{['ID','Username','Email','Role','Staff','Joined','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {usersPag.slice.map(u => (
                <tr key={u.id} style={S.tr}>
                  <td style={S.td}>{u.id}</td>
                  <td style={S.td}>{u.username}</td>
                  <td style={S.td}>{u.email}</td>
                  <td style={S.td}><span style={{ ...S.badge, background: u.role === 'seller' ? '#e3f2fd' : '#e8f5e9', color: u.role === 'seller' ? '#1565c0' : '#2E7D32' }}>{u.role}</span></td>
                  <td style={S.td}>{u.is_staff ? '✅' : '—'}</td>
                  <td style={S.td}>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td style={S.td}>{!u.is_staff && <button style={S.btnDel} onClick={() => deleteUser(u.id)}>Delete</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...usersPag} />
          </>
        )}

        {/* SELLERS */}
        {tab === 'Sellers' && (
          <>
          <table style={S.table}>
            <thead><tr>{['ID','Username','Email','Shop','Verified','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {sellersPag.slice.map(s => (
                <>
                  <tr key={s.id} style={S.tr}>
                    <td style={S.td}>{s.id}</td>
                    <td style={S.td}>{s.username}</td>
                    <td style={S.td}>{s.email}</td>
                    <td style={S.td}>{s.shop_name || s.onboarding?.store_name || '—'}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: s.is_validated ? '#e8f5e9' : '#fff3e0', color: s.is_validated ? '#2E7D32' : '#e65100' }}>{s.is_validated ? '✅ Verified' : '⏳ Pending'}</span></td>
                    <td style={S.td}>
                      <button style={S.btnBlue} onClick={() => setExpandedSeller(expandedSeller === s.id ? null : s.id)}>
                        {expandedSeller === s.id ? 'Hide' : 'View Details'}
                      </button>
                      <button style={{ ...S.btnGreen, marginLeft: '6px' }} onClick={() => toggleSeller(s.id, s.is_validated)}>
                        {s.is_validated ? 'Unverify' : 'Verify'}
                      </button>
                      <button style={{ ...S.btnDel, marginLeft: '6px' }} onClick={() => deleteSeller(s.id)}>Delete</button>
                    </td>
                  </tr>
                  {expandedSeller === s.id && s.onboarding && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={6} style={{ padding: '0', background: '#f9fbe7' }}>
                        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          {[
                            ['Business Name', s.onboarding.business_name],
                            ['Business Type', s.onboarding.business_type],
                            ['Store Name', s.onboarding.store_name],
                            ['Store Category', s.onboarding.store_category],
                            ['Owner Name', s.onboarding.owner_full_name],
                            ['Phone', s.onboarding.phone_number],
                            ['Business Address', s.onboarding.business_address],
                            ['Province', s.onboarding.province],
                            ['Payment Method', s.onboarding.payment_method],
                            ['Bank Name', s.onboarding.bank_name],
                            ['Account Name', s.onboarding.bank_account_name],
                            ['Terms Agreed', s.onboarding.agreed_terms ? 'Yes' : 'No'],
                          ].map(([label, val]) => (
                            <div key={label} style={{ background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '3px' }}>{label}</div>
                              <div style={{ fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>{val || '—'}</div>
                            </div>
                          ))}
                          {s.onboarding.id_proof && (
                            <div style={{ background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>ID Proof</div>
                              <a href={s.onboarding.id_proof} target="_blank" rel="noreferrer" style={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.88rem' }}>View Document</a>
                            </div>
                          )}
                          {s.onboarding.business_document && (
                            <div style={{ background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>Business Document</div>
                              <a href={s.onboarding.business_document} target="_blank" rel="noreferrer" style={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.88rem' }}>View Document</a>
                            </div>
                          )}
                          <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button style={{ ...S.btnGreen, padding: '8px 20px', fontSize: '0.9rem' }} onClick={() => toggleSeller(s.id, s.is_validated)}>
                              {s.is_validated ? '✗ Unverify Seller' : '✓ Verify Seller'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {expandedSeller === s.id && !s.onboarding && (
                    <tr key={`${s.id}-no-detail`}>
                      <td colSpan={6} style={{ padding: '16px 24px', background: '#fff3e0', color: '#e65100', fontSize: '0.88rem' }}>
                        ⚠️ This seller has not completed onboarding yet.
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          <Pagination {...sellersPag} />
          </>
        )}

        {/* PRODUCTS */}
        {tab === 'Products' && (
          <>
            {editingProduct && (
              <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <h3 style={{ color: '#1B5E20', marginBottom: '16px' }}>Edit Product #{editingProduct.id}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[['name','Name'],['price','Price'],['stock','Stock']].map(([field, label]) => (
                    <div key={field}>
                      <label style={S.label}>{label}</label>
                      <input style={S.inputEdit} value={editingProduct[field]} onChange={e => setEditingProduct({...editingProduct, [field]: e.target.value})} />
                    </div>
                  ))}
                  <div>
                    <label style={S.label}>Eco Category</label>
                    <select style={S.inputEdit} value={editingProduct.eco_category_id || ''} onChange={e => setEditingProduct({...editingProduct, eco_category_id: e.target.value})}>
                      <option value="">— None —</option>
                      {ecoCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Product Category</label>
                    <select style={S.inputEdit} value={editingProduct.product_category_id || ''} onChange={e => setEditingProduct({...editingProduct, product_category_id: e.target.value})}>
                      <option value="">— None —</option>
                      {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={S.label}>Description</label>
                    <textarea style={{ ...S.inputEdit, height: '80px', resize: 'vertical' }} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button style={{ ...S.btnGreen, padding: '8px 20px' }} onClick={saveProduct}>Save Changes</button>
                  <button style={{ ...S.btnWarn, padding: '8px 20px' }} onClick={() => setEditingProduct(null)}>Cancel</button>
                </div>
              </div>
            )}
            <table style={S.table}>
              <thead><tr>{['ID','Image','Name','Price','Stock','Eco Cat','Product Cat','Seller','Verified','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {productsPag.slice.map(p => (
                  <tr key={p.id} style={S.tr}>
                    <td style={S.td}>{p.id}</td>
                    <td style={S.td}>{p.image_url && <img src={p.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />}</td>
                    <td style={S.td}>{p.name}</td>
                    <td style={S.td}>Rs {p.price}</td>
                    <td style={S.td}>{p.stock}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: '#e8f5e9', color: '#2E7D32' }}>{p.eco_category}</span></td>
                    <td style={S.td}><span style={{ ...S.badge, background: '#e3f2fd', color: '#1565c0' }}>{p.product_category}</span></td>
                    <td style={S.td}>{p.seller}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: p.is_validated ? '#e8f5e9' : '#fff3e0', color: p.is_validated ? '#2E7D32' : '#e65100' }}>{p.is_validated ? '✅' : '⏳'}</span></td>
                    <td style={S.td}>
                      <button style={S.btnBlue} onClick={() => setEditingProduct({...p})}>Edit</button>
                      <button style={{ ...S.btnGreen, marginLeft: '4px' }} onClick={() => toggleProduct(p.id, p.is_validated)}>{p.is_validated ? 'Unverify' : 'Verify'}</button>
                      <button style={{ ...S.btnDel, marginLeft: '4px' }} onClick={() => deleteProduct(p.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination {...productsPag} />
          </>
        )}

        {/* ORDERS */}
        {tab === 'Orders' && (
          <>
          <table style={S.table}>
            <thead><tr>{['ID','Customer','Total','Status','Payment','Date','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {ordersPag.slice.map(o => (
                <tr key={o.id} style={S.tr}>
                  <td style={S.td}>#{o.id}</td>
                  <td style={S.td}>{o.customer}</td>
                  <td style={S.td}>Rs {Math.round(o.total_amount)}</td>
                  <td style={S.td}>
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={S.select}>
                      {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={S.td}><span style={S.badge}>{o.payment_status}</span></td>
                  <td style={S.td}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={S.td}><button style={S.btnDel} onClick={() => deleteOrder(o.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...ordersPag} />
          </>
        )}

        {/* CUSTOMERS */}
        {tab === 'Customers' && (
          <>
          <table style={S.table}>
            <thead><tr>{['ID','Username','First Name','Last Name','Email','Address','Green Points','Joined','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {customersPag.slice.map(c => (
                <tr key={c.id} style={S.tr}>
                  <td style={S.td}>{c.id}</td>
                  <td style={S.td}>{c.username}</td>
                  <td style={S.td}>{c.first_name}</td>
                  <td style={S.td}>{c.last_name}</td>
                  <td style={S.td}>{c.email}</td>
                  <td style={S.td}>{c.address}</td>
                  <td style={S.td}><span style={{ ...S.badge, background: '#e8f5e9', color: '#2E7D32' }}>🌿 {c.green_points}</span></td>
                  <td style={S.td}>{c.date_joined ? new Date(c.date_joined).toLocaleDateString() : '—'}</td>
                  <td style={S.td}><button style={S.btnDel} onClick={() => deleteCustomer(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...customersPag} />
          </>
        )}

        {/* RATINGS */}
        {tab === 'Ratings' && (
          <>
          <table style={S.table}>
            <thead><tr>{['ID','Product','User','Rating','Review','Date','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {ratingsPag.slice.map(r => (
                <tr key={r.id} style={S.tr}>
                  <td style={S.td}>{r.id}</td>
                  <td style={S.td}>{r.product_name}</td>
                  <td style={S.td}>{r.user}</td>
                  <td style={S.td}>{'⭐'.repeat(r.rating)} ({r.rating})</td>
                  <td style={S.td} title={r.review}>{r.review?.length > 40 ? r.review.slice(0, 40) + '...' : r.review}</td>
                  <td style={S.td}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={S.td}><button style={S.btnDel} onClick={() => deleteRating(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...ratingsPag} />
          </>
        )}

        {/* CATEGORIES */}
        {tab === 'Categories' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
              <select value={newCatType} onChange={e => setNewCatType(e.target.value)} style={{ ...S.select, padding: '9px 12px' }}>
                <option value="Eco">Eco Category</option>
                <option value="Product">Product Category</option>
              </select>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" style={{ ...S.select, padding: '9px 14px', flex: 1 }} />
              <button style={{ ...S.btnGreen, padding: '9px 20px', fontSize: '0.9rem' }} onClick={addCategory}>+ Add</button>
            </div>
            <table style={S.table}>
              <thead><tr>{['ID','Type','Name','Slug','Active','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {categoriesPag.slice.map(c => (
                  <tr key={`${c.type}-${c.id}`} style={S.tr}>
                    <td style={S.td}>{c.id}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: c.type === 'Eco' ? '#e8f5e9' : '#e3f2fd', color: c.type === 'Eco' ? '#2E7D32' : '#1565c0' }}>{c.type}</span></td>
                    <td style={S.td}>{c.name}</td>
                    <td style={S.td}>{c.slug}</td>
                    <td style={S.td}>{c.is_active ? '✅' : '—'}</td>
                    <td style={S.td}><button style={S.btnDel} onClick={() => deleteCategory(c.type, c.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination {...categoriesPag} />
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'inherit', background: '#f5f6fa' },
  sidebar: { width: '220px', background: '#1B5E20', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', height: '100vh' },
  logo: { padding: '0 20px 24px', fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: '10px' },
  navBtn: { background: 'none', border: 'none', color: 'white', padding: '12px 20px', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', width: '100%' },
  navActive: { background: 'rgba(255,255,255,0.15)', borderLeft: '3px solid #81C784' },
  main: { marginLeft: '220px', flex: 1, padding: '30px', position: 'relative' },
  heading: { color: '#1B5E20', marginBottom: '24px', fontSize: '1.6rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' },
  card: { background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  th: { background: '#2E7D32', color: 'white', padding: '12px 14px', textAlign: 'left', fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '11px 14px', fontSize: '0.88rem', color: '#333' },
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, background: '#f0f0f0' },
  btnGreen: { background: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem' },
  btnBlue: { background: '#1565c0', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem' },
  btnWarn: { background: '#FF9800', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem' },
  btnDel: { background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem' },
  select: { padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.82rem' },
  inputEdit: { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px', fontWeight: 600 },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  chartBox: { background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  chartTitle: { color: '#1B5E20', fontSize: '1rem', fontWeight: 700, marginBottom: '16px', marginTop: 0 },
};
