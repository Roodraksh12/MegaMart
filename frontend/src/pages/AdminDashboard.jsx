import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Truck, ShieldCheck, Eye, EyeOff, Tag, Settings, Trash2, Plus, RefreshCw, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── helpers ────────────────────────────────────────
function randomCode(prefix = 'SUPER') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState(sessionStorage.getItem('adminToken') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'store' | 'settings'
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Change password state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', isError: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'veg-fruits', price: '', mrp: '', image: '📦', unit: '1 pc', in_stock: true, is_fresh: false });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── Store Settings state ──────────────────────────
  const [deliverySettings, setDeliverySettings] = useState({ deliveryFee: 30, freeAbove: 150 });
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState('');

  // ── Account state ──────────────────────────────────
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [accountMsg, setAccountMsg] = useState({ text: '', isError: false });
  const [accountSaving, setAccountSaving] = useState(false);

  // Promo codes
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: randomCode(),
    discountType: 'percent',
    discountValue: 10,
    minOrder: 0,
    maxUses: 0,
    expiresAt: '',
  });
  const [promoMsg, setPromoMsg] = useState({ text: '', isError: false });

  const { products, fetchProducts } = useStore();

  // ── Fetch helpers ──────────────────────────────────
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };

  async function fetchOrders() {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/admin/orders`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
      if (!res.ok) { if (res.status === 401 || res.status === 403) setAdminToken(null); return; }
      const data = await res.json();
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  async function fetchDeliverySettings() {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
      if (res.ok) { const data = await res.json(); setDeliverySettings(data); }
    } catch (err) { console.error(err); }
  }

  async function fetchPromoCodes() {
    try {
      setPromoLoading(true);
      const res = await fetch(`${API_URL}/api/admin/promo-codes`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
      if (res.ok) { const data = await res.json(); setPromoCodes(data); }
    } catch (err) { console.error(err); } finally { setPromoLoading(false); }
  }

  useEffect(() => {
    if (adminToken) { fetchProducts(); fetchOrders(); fetchDeliverySettings(); fetchPromoCodes(); }
  }, [adminToken]);

  // Fetch store settings data when switching to store tab
  async function fetchAccountDetails() {
    try {
      const res = await fetch(`${API_URL}/api/admin/account`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
      if (res.ok) { 
        const data = await res.json(); 
        setAccountForm(f => ({ ...f, name: data.mart_name || '', email: data.mart_email || '', phone: data.mart_phone || '', username: data.admin_username || '' })); 
      }
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (activeTab === 'store' && adminToken) { fetchDeliverySettings(); fetchPromoCodes(); }
    if (activeTab === 'account' && adminToken) { fetchAccountDetails(); }
  }, [activeTab]);

  // Auto-logout on inactivity
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { if (adminToken) { sessionStorage.removeItem('adminToken'); setAdminToken(null); } }, 5 * 60 * 1000);
    };
    if (adminToken) {
      ['mousemove', 'keypress', 'scroll', 'click'].forEach(e => window.addEventListener(e, resetTimer));
      resetTimer();
    }
    return () => {
      clearTimeout(timeoutId);
      ['mousemove', 'keypress', 'scroll', 'click'].forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [adminToken]);

  // ── Handlers ──────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/admin-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (data.token) { sessionStorage.setItem('adminToken', data.token); setAdminToken(data.token); }
      else alert(data.error);
    } catch (err) { console.error(err); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/admin/orders/${orderId}`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ status: newStatus }) });
      setAllOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) { console.error(err); }
  };

  const handleToggleStock = async (productId, currentIsStocked) => {
    try {
      await fetch(`${API_URL}/api/admin/products/${productId}`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ in_stock: !currentIsStocked }) });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = newProduct.image;
      if (imageFile) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => { reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(imageFile); });
        const uploadRes = await fetch(`${API_URL}/api/admin/upload-image`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ base64, fileName: imageFile.name, mimeType: imageFile.type }) });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
        imageUrl = uploadData.url;
      }
      
      const isEditing = !!newProduct.id;
      const endpoint = isEditing ? `${API_URL}/api/admin/products/${newProduct.id}` : `${API_URL}/api/admin/products`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, { method, headers: authHeaders, body: JSON.stringify({ ...newProduct, image: imageUrl, price: Number(newProduct.price), mrp: Number(newProduct.mrp) }) });
      if (res.ok) { setShowAddProduct(false); setNewProduct({ name: '', category: 'veg-fruits', price: '', mrp: '', image: '📦', unit: '1 pc', in_stock: true, is_fresh: false }); setImageFile(null); setImagePreview(null); fetchProducts(); }
      else alert('Failed to save product');
    } catch (err) { console.error(err); alert('Error: ' + err.message); } finally { setIsUploading(false); }
  };

  const handleEditProductClick = (product) => {
    setNewProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      mrp: product.originalPrice || product.price,
      image: product.image,
      unit: product.unit,
      in_stock: product.inStock,
      is_fresh: product.tags?.includes('fresh') || false
    });
    setImageFile(null);
    setImagePreview(null);
    setShowAddProduct(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', isError: false });
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ text: 'New passwords do not match.', isError: true }); return; }
    if (pwForm.newPw.length < 8) { setPwMsg({ text: 'New password must be at least 8 characters.', isError: true }); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin-change-password`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }) });
      const data = await res.json();
      if (res.ok) { setPwMsg({ text: '✅ Password updated! You will be logged out.', isError: false }); setPwForm({ current: '', newPw: '', confirm: '' }); setTimeout(() => { sessionStorage.removeItem('adminToken'); setAdminToken(null); }, 2000); }
      else setPwMsg({ text: data.error || 'Failed.', isError: true });
    } catch { setPwMsg({ text: 'Network error.', isError: true }); } finally { setPwLoading(false); }
  };

  const handleSaveDelivery = async () => {
    setDeliverySaving(true);
    setDeliveryMsg('');
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, { method: 'POST', headers: authHeaders, body: JSON.stringify(deliverySettings) });
      const data = await res.json();
      setDeliveryMsg(res.ok ? '✅ Delivery settings saved!' : (data.error || 'Failed to save'));
    } catch { setDeliveryMsg('Network error'); } finally { setDeliverySaving(false); setTimeout(() => setDeliveryMsg(''), 3000); }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountSaving(true);
    setAccountMsg({ text: '', isError: false });
    try {
      const res = await fetch(`${API_URL}/api/admin/account`, { method: 'POST', headers: authHeaders, body: JSON.stringify(accountForm) });
      const data = await res.json();
      if (res.ok) {
        setAccountMsg({ text: '✅ Account details saved successfully!', isError: false });
        setAccountForm(f => ({ ...f, password: '' }));
      } else {
        setAccountMsg({ text: data.error || 'Failed to save', isError: true });
      }
    } catch { setAccountMsg({ text: 'Network error', isError: true }); } 
    finally { setAccountSaving(false); setTimeout(() => setAccountMsg({ text: '', isError: false }), 4000); }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setPromoMsg({ text: '', isError: false });
    try {
      const res = await fetch(`${API_URL}/api/admin/promo-codes`, { method: 'POST', headers: authHeaders, body: JSON.stringify(newPromo) });
      const data = await res.json();
      if (res.ok) {
        setPromoMsg({ text: `✅ Code "${data.promo.code}" created!`, isError: false });
        setNewPromo({ code: randomCode(), discountType: 'percent', discountValue: 10, minOrder: 0, maxUses: 0, expiresAt: '' });
        fetchPromoCodes();
      } else {
        setPromoMsg({ text: data.error || 'Failed to create promo', isError: true });
      }
    } catch { setPromoMsg({ text: 'Network error', isError: true }); }
    setTimeout(() => setPromoMsg({ text: '', isError: false }), 4000);
  };

  const handleDeletePromo = async (code) => {
    if (!window.confirm(`Delete promo code "${code}"?`)) return;
    try {
      await fetch(`${API_URL}/api/admin/promo-codes/${code}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` } });
      fetchPromoCodes();
    } catch (err) { console.error(err); }
  };

  // ── Login screen ───────────────────────────────────
  if (!adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-surface max-w-md w-full rounded-2xl p-8 shadow-xl text-center border border-gray-100">
          <span className="text-5xl">🔐</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Admin Dashboard</h2>
          <p className="text-gray-500 mb-8 text-sm">Enter your credentials to access the store control center.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-center focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Username" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-center tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" />
            <button type="submit" className="w-full btn-primary py-3">Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">📦 Store Control Center</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage orders, inventory, delivery fees and promo codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-orange-200">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span></span>
            Live Admin
          </div>
          <button onClick={() => { sessionStorage.removeItem('adminToken'); setAdminToken(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200">
            🔒 Lock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar gap-0">
        {[
          { id: 'orders', label: `Orders (${allOrders.length})`, icon: '🛒' },
          { id: 'inventory', label: `Inventory (${products.length})`, icon: '📦' },
          { id: 'store', label: 'Store Settings', icon: '⚙️' },
          { id: 'account', label: 'My Account', icon: '👤' },
          { id: 'settings', label: 'Security', icon: '🔐' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-5 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'
            )}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400">Loading orders...</div>
          ) : allOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <h3 className="text-xl font-bold text-gray-800 mt-4">No orders yet</h3>
              <p className="text-gray-400">When a customer checks out, their order will appear here.</p>
            </div>
          ) : (
            allOrders.map(order => {
              let addr = {};
              try { addr = JSON.parse(order.delivery_address); } catch (e) {}
              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gray-50 border-b border-gray-100 p-4 sm:px-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-lg">{order.id}</span>
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-green-100 text-green-700'
                        )}>{order.status}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(order.created_at).toLocaleString()}</span>
                        <span className="font-medium text-gray-700">₹{order.total_amount?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === 'Processing' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1">
                          <Truck size={14} /> Dispatch
                        </button>
                      )}
                      {order.status === 'Out for Delivery' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-1">
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <span className="text-sm text-green-600 font-bold flex items-center gap-1"><CheckCircle size={16} /> Completed</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📍 Customer Info</h4>
                      <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p><span className="text-gray-400">Name:</span> <b>{addr.name || 'N/A'}</b></p>
                        <p><span className="text-gray-400">Phone:</span> <b>{order.customer_phone || addr.phone || 'N/A'}</b></p>
                        <p><span className="text-gray-400">Address:</span> {addr.houseNo}, {addr.street}</p>
                        <p><span className="text-gray-400">Pincode:</span> {addr.pincode}</p>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded">Slot: {addr.slot}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🛒 Items</h4>
                      <div className="text-sm border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                        {order.items?.length > 0 ? (
                          <table className="w-full">
                            <thead><tr className="border-b border-gray-200 text-xs text-gray-400"><th className="text-left px-3 py-2">Item</th><th className="text-center px-3 py-2">Qty</th><th className="text-right px-3 py-2">Price</th></tr></thead>
                            <tbody>
                              {order.items.map((item, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                  <td className="px-3 py-2 font-medium">{item.image} {item.name}</td>
                                  <td className="px-3 py-2 text-center text-gray-500">×{item.quantity}</td>
                                  <td className="px-3 py-2 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot><tr className="border-t border-gray-200 bg-gray-100"><td colSpan={2} className="px-3 py-2 text-xs font-bold text-gray-500">Total</td><td className="px-3 py-2 text-right font-bold text-primary">₹{order.total_amount?.toFixed(2)}</td></tr></tfoot>
                          </table>
                        ) : <p className="px-3 py-4 text-gray-400 text-center text-xs">No item details</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── INVENTORY TAB ── */}
      {activeTab === 'inventory' && (
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-center gap-3 text-sm flex-1">
              <span className="text-2xl">▶️</span>
              <p>Toggle stock levels or add new products to your live inventory.</p>
            </div>
            <button onClick={() => {
              setNewProduct({ name: '', category: 'veg-fruits', price: '', mrp: '', image: '📦', unit: '1 pc', in_stock: true, is_fresh: false });
              setImageFile(null);
              setImagePreview(null);
              setShowAddProduct(true);
            }} className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-md">
              <Plus size={16} /> Add New Product
            </button>
          </div>

          {showAddProduct && (
            <div className="bg-white border-2 border-primary/20 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">✨ {newProduct.id ? 'Edit Product' : 'Ship New Product'}</h3>
                <button type="button" onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕ Close</button>
              </div>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Product Name</label><input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="e.g., Organic Bananas" /></div>
                <div><label className="block text-xs font-semibold mb-1">Category</label>
                  <select required value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full border rounded p-2 text-sm bg-white">
                    <option value="veg-fruits">Vegetables & Fruits</option>
                    <option value="dairy">Dairy & Eggs</option>
                    <option value="bakery">Bakery & Bread</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="beverages">Beverages</option>
                    <option value="snacks">Snacks</option>
                    <option value="staples">Staples</option>
                    <option value="frozen">Frozen Foods</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold mb-1">Selling Price (₹)</label><input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="45" /></div>
                <div><label className="block text-xs font-semibold mb-1">MRP (₹)</label><input type="number" required value={newProduct.mrp} onChange={e => setNewProduct({ ...newProduct, mrp: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="60" /></div>
                <div><label className="block text-xs font-semibold mb-1">Unit / Weight</label><input type="text" required value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="1 kg" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Image</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                      {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" /> : <span className="text-2xl">{newProduct.image || '📦'}</span>}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer w-full flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg px-3 py-2 text-xs font-bold transition-colors">
                        📁 Choose Image
                        <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Or type emoji below</p>
                      <input type="text" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full border rounded p-1.5 text-xs mt-1" placeholder="📦 or emoji" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={newProduct.is_fresh} onChange={e => setNewProduct({ ...newProduct, is_fresh: e.target.checked })} className="w-4 h-4 text-primary" />
                    Mark as "Today's Fresh Pick"
                  </label>
                  <button type="submit" disabled={isUploading} className="btn-primary py-2 px-8 shadow-md disabled:opacity-60 flex items-center gap-2">
                    {isUploading ? <><span className="animate-spin">⏳</span> Saving...</> : (newProduct.id ? 'Save Changes' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className={cn('border rounded-xl p-4 flex items-center gap-4 transition-all', product.inStock ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-300 opacity-60 grayscale')}>
                <div className="text-4xl bg-gray-100 w-16 h-16 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
                  {product.image?.startsWith('http') ? <img src={product.image} className="w-full h-full object-cover" alt="" /> : product.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{product.unit} • ₹{product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleToggleStock(product.id, product.inStock)} className={cn('text-xs font-bold px-3 py-1.5 rounded-full transition-colors', product.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200')}>
                      {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                    </button>
                    <button onClick={() => handleEditProductClick(product)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STORE SETTINGS TAB ── */}
      {activeTab === 'store' && (
        <div className="animate-fade-in space-y-8 max-w-2xl">

          {/* Delivery Fee Config */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <Truck size={18} className="text-primary" />
              <div>
                <h3 className="font-bold text-gray-900">Delivery Fee Settings</h3>
                <p className="text-xs text-gray-500">Set a flat delivery fee and a threshold for free delivery</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Delivery Fee (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input
                      type="number" min="0"
                      value={deliverySettings.deliveryFee}
                      onChange={e => setDeliverySettings(s => ({ ...s, deliveryFee: Number(e.target.value) }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pl-8 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Charged when order is below threshold</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Free Delivery Above (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <input
                      type="number" min="0"
                      value={deliverySettings.freeAbove}
                      onChange={e => setDeliverySettings(s => ({ ...s, freeAbove: Number(e.target.value) }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pl-8 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Orders above this get free delivery</p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-green-800 text-xs uppercase tracking-wider mb-2">Preview</p>
                <p className="text-gray-700">Order under <b>₹{deliverySettings.freeAbove}</b> → delivery fee of <b className="text-orange-600">₹{deliverySettings.deliveryFee}</b></p>
                <p className="text-gray-700">Order <b>₹{deliverySettings.freeAbove}+</b> → <b className="text-green-600">FREE delivery 🎉</b></p>
              </div>

              {deliveryMsg && <p className={`text-sm font-medium ${deliveryMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{deliveryMsg}</p>}

              <button onClick={handleSaveDelivery} disabled={deliverySaving} className="btn-primary py-2.5 px-6 flex items-center gap-2 disabled:opacity-60">
                {deliverySaving ? 'Saving...' : <><Settings size={15} /> Save Delivery Settings</>}
              </button>
            </div>
          </div>

          {/* Promo Code Generator */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <Tag size={18} className="text-primary" />
              <div>
                <h3 className="font-bold text-gray-900">Promo Codes</h3>
                <p className="text-xs text-gray-500">Generate discount codes for your customers</p>
              </div>
            </div>
            <form onSubmit={handleCreatePromo} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text" required
                      value={newPromo.code}
                      onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="SUPER10"
                    />
                    <button type="button" title="Generate new code" onClick={() => setNewPromo(p => ({ ...p, code: randomCode() }))} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0">
                      <RefreshCw size={15} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Discount Type</label>
                  <select value={newPromo.discountType} onChange={e => setNewPromo(p => ({ ...p, discountType: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                    <option value="percent">Percentage (e.g. 10%)</option>
                    <option value="flat">Flat Amount (e.g. ₹50)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Discount Value ({newPromo.discountType === 'percent' ? '%' : '₹'})</label>
                  <input type="number" required min="1" value={newPromo.discountValue} onChange={e => setNewPromo(p => ({ ...p, discountValue: Number(e.target.value) }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min. Order (₹) <span className="text-gray-400 font-normal">optional</span></label>
                  <input type="number" min="0" value={newPromo.minOrder} onChange={e => setNewPromo(p => ({ ...p, minOrder: Number(e.target.value) }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="0 = no minimum" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max Uses <span className="text-gray-400 font-normal">optional</span></label>
                  <input type="number" min="0" value={newPromo.maxUses} onChange={e => setNewPromo(p => ({ ...p, maxUses: Number(e.target.value) }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="0 = unlimited" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Expires On <span className="text-gray-400 font-normal">optional</span></label>
                  <input type="date" value={newPromo.expiresAt} onChange={e => setNewPromo(p => ({ ...p, expiresAt: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              {promoMsg.text && <p className={`text-sm font-medium ${promoMsg.isError ? 'text-red-500' : 'text-green-600'}`}>{promoMsg.text}</p>}

              <button type="submit" className="btn-primary py-2.5 px-6 flex items-center gap-2">
                <Tag size={15} /> Create Promo Code
              </button>
            </form>

            {/* Existing codes list */}
            {promoCodes.length > 0 && (
              <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Codes ({promoCodes.length})</h4>
                  <button onClick={fetchPromoCodes} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
                </div>
                <div className="space-y-2">
                  {promoCodes.map(promo => (
                    <div key={promo.code} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded text-sm">{promo.code}</span>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p className="font-semibold text-gray-700">
                            {promo.discountType === 'percent' ? `${promo.discountValue}% off` : `₹${promo.discountValue} off`}
                            {promo.minOrder > 0 && <span className="font-normal text-gray-400"> · min ₹{promo.minOrder}</span>}
                          </p>
                          <p>
                            {promo.maxUses > 0 ? `${promo.usedCount}/${promo.maxUses} uses` : 'Unlimited uses'}
                            {promo.expiresAt && ` · expires ${new Date(promo.expiresAt).toLocaleDateString('en-IN')}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDeletePromo(promo.code)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {promoLoading && <p className="text-center text-sm text-gray-400 py-4">Loading codes...</p>}
          </div>
        </div>
      )}

      {/* ── MY ACCOUNT TAB ── */}
      {activeTab === 'account' && (
        <div className="animate-fade-in max-w-lg space-y-8">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <span className="text-xl">👤</span>
              <div>
                <h3 className="font-bold text-gray-900">Mart Owner Details</h3>
                <p className="text-xs text-gray-500">Publicly visible contact details for your store</p>
              </div>
            </div>
            <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Owner / Mart Name</label>
                <input type="text" value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. SuperMart" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Admin Login Username</label>
                <input type="text" required value={accountForm.username} onChange={e => setAccountForm(f => ({ ...f, username: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. admin" />
                <p className="text-[10px] text-gray-400 mt-1">Changing this requires logging in with the new username</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Support Email</label>
                <input type="email" value={accountForm.email} onChange={e => setAccountForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. contact@supermart.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">WhatsApp / Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm font-bold">+91</span>
                  <input type="tel" value={accountForm.phone} onChange={e => {
                    setAccountForm(f => ({ ...f, phone: e.target.value.replace(/\\D/g, '') }))
                  }} className="w-full border border-gray-200 bg-gray-50 rounded-r-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="9876543210" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">This number receives WhatsApp orders</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-600 mb-1">Admin Password <span className="text-red-500">*</span></label>
                <input type="password" required value={accountForm.password} onChange={e => setAccountForm(f => ({ ...f, password: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Enter password to save changes" />
              </div>

              {accountMsg.text && <div className={`text-sm font-medium ${accountMsg.isError ? 'text-red-500' : 'text-green-600'}`}>{accountMsg.text}</div>}

              <button type="submit" disabled={accountSaving} className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {accountSaving ? 'Saving...' : 'Save Account Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in max-w-lg">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <ShieldCheck size={20} className="text-primary" />
              <div>
                <h3 className="font-bold text-gray-900">Change Admin Password</h3>
                <p className="text-xs text-gray-500">Requires your current password to confirm identity</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'new', label: 'New Password', placeholder: 'Min. 8 characters', stateKey: 'newPw' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
              ].map(({ key, label, placeholder, stateKey }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw[key] ? 'text' : 'password'} required
                      value={pwForm[stateKey || key]}
                      onChange={e => setPwForm(f => ({ ...f, [stateKey || key]: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder={placeholder}
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              {pwMsg.text && <div className={`px-4 py-3 rounded-xl text-sm font-medium ${pwMsg.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{pwMsg.text}</div>}
              <button type="submit" disabled={pwLoading} className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {pwLoading ? 'Updating...' : <><ShieldCheck size={16} /> Update Password</>}
              </button>
            </form>
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            ⚠️ After changing the password, you will be automatically logged out.
          </div>
        </div>
      )}
    </div>
  );
}
