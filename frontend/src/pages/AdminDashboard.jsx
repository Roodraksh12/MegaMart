import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Truck, ShieldCheck, Eye, EyeOff, Tag, Settings, Trash2, Plus, RefreshCw, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';

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

  // Bulk Product Add State
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState({ loading: false, msg: '', isError: false });

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
      const { data, error } = await supabase.from('orders').select('*, items:order_items(*, product:products(*))').order('created_at', { ascending: false });
      if (error) throw error;
      const mappedOrders = (data || []).map(order => ({
        ...order,
        items: (order.items || []).map(item => ({
           id: item.product?.id,
           name: item.product?.name,
           image: item.product?.image,
           quantity: item.quantity,
           price: item.price_at_time
        }))
      }));
      setAllOrders(mappedOrders);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  async function fetchDeliverySettings() {
    try {
      const { data } = await supabase.from('admin_settings').select('key, value').in('key', ['delivery_fee', 'free_delivery_above']);
      const settings = {};
      (data || []).forEach(row => { settings[row.key] = row.value; });
      setDeliverySettings({
        deliveryFee: Number(settings.delivery_fee ?? 30),
        freeAbove: Number(settings.free_delivery_above ?? 150),
      });
    } catch (err) { console.error(err); }
  }

  async function fetchPromoCodes() {
    try {
      setPromoLoading(true);
      const { data, error } = await supabase.from('admin_settings').select('key, value').like('key', 'promo_%');
      if (error) throw error;
      const codes = (data || []).map(row => {
        try { return JSON.parse(row.value); } catch { return null; }
      }).filter(Boolean);
      setPromoCodes(codes);
    } catch (err) { console.error(err); } finally { setPromoLoading(false); }
  }

  useEffect(() => {
    if (adminToken) { fetchProducts(); fetchOrders(); fetchDeliverySettings(); fetchPromoCodes(); }
  }, [adminToken]);

  // Fetch store settings data when switching to store tab
  async function fetchAccountDetails() {
    try {
      const { data } = await supabase.from('admin_settings').select('key, value').in('key', ['mart_name', 'mart_email', 'mart_phone', 'admin_username']);
      const settings = {};
      (data || []).forEach(row => { settings[row.key] = row.value; });
      setAccountForm(f => ({ ...f, name: settings.mart_name || '', email: settings.mart_email || '', phone: settings.mart_phone || '', username: settings.admin_username || '' })); 
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
      const { data: userRaw } = await supabase.from('admin_settings').select('value').eq('key', 'admin_username').single();
      const { data: pwRaw } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
      const validUser = userRaw?.value || 'admin';
      const validPw = pwRaw?.value || 'SuperAdmin123!';
      
      if (username === validUser && password === validPw) {
        sessionStorage.setItem('adminToken', 'active-session');
        setAdminToken('active-session');
      } else {
        alert('Invalid admin credentials.');
      }
    } catch (err) { alert('Database error resolving login.'); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      setAllOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) { console.error(err); }
  };

  const handleToggleStock = async (productId, currentIsStocked) => {
    try {
      await supabase.from('products').update({ in_stock: !currentIsStocked }).eq('id', productId);
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
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
      
      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        mrp: Number(newProduct.mrp),
        image: imageUrl,
        unit: newProduct.unit,
        in_stock: newProduct.in_stock,
        is_fresh: newProduct.is_fresh
      };

      if (newProduct.id) {
        await supabase.from('products').update(payload).eq('id', newProduct.id);
      } else {
        const newId = `p${Math.floor(Math.random() * 999999)}`;
        await supabase.from('products').insert({ ...payload, id: newId });
      }

      setShowAddProduct(false);
      setNewProduct({ name: '', category: 'veg-fruits', price: '', mrp: '', image: '📦', unit: '1 pc', in_stock: true, is_fresh: false });
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();
    } catch (err) { console.error(err); alert('Error: ' + err.message); } finally { setIsUploading(false); }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkStatus({ loading: true, msg: '', isError: false });
    
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) {
      setBulkStatus({ loading: false, msg: 'No data provided', isError: true });
      return;
    }

    const payloadProducts = [];
    for (const line of lines) {
      const cols = line.split(',').map(c => c.trim());
      if (cols.length >= 3) {
        payloadProducts.push({
          id: `p${Math.floor(Math.random() * 999999) + Date.now()}`,
          name: cols[0],
          category: cols[1] || 'veg-fruits',
          price: Number(cols[2]) || 0,
          mrp: cols[3] && !isNaN(Number(cols[3])) ? Number(cols[3]) : Number(cols[2]) || 0,
          image: cols[4] || '📦',
          unit: cols[5] || '1 pc',
          in_stock: cols[6] ? cols[6].toLowerCase() !== 'false' : true,
          is_fresh: cols[7] ? cols[7].toLowerCase() === 'true' : false,
        });
      }
    }

    if (payloadProducts.length === 0) {
      setBulkStatus({ loading: false, msg: 'No valid rows found', isError: true });
      return;
    }

    try {
      const { error } = await supabase.from('products').insert(payloadProducts);
      if (error) throw error;
      
      setBulkStatus({ loading: false, msg: `✅ Success!`, isError: false });
      setBulkText('');
      fetchProducts();
      setTimeout(() => setShowBulkAdd(false), 2000);
    } catch (err) {
      setBulkStatus({ loading: false, msg: 'Network error: ' + err.message, isError: true });
    }
  };

  const handleEditProductClick = (product) => {
    setNewProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      mrp: product.mrp || product.price,   // fixed: was product.originalPrice which doesn't exist
      image: product.image,
      unit: product.unit,
      in_stock: product.inStock,
      is_fresh: product.isFresh || product.tags?.includes('fresh') || false
    });
    setImageFile(null);
    setImagePreview(null);
    setShowAddProduct(true);
  };

  const handleDeleteProductClick = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product: ' + err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', isError: false });
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ text: 'New passwords do not match.', isError: true }); return; }
    if (pwForm.newPw.length < 8) { setPwMsg({ text: 'New password must be at least 8 characters.', isError: true }); return; }
    setPwLoading(true);
    try {
      const { data: pwRaw } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
      const currentStored = pwRaw?.value || 'SuperAdmin123!';
      if (pwForm.current !== currentStored) {
        setPwMsg({ text: 'Current password is incorrect', isError: true });
        setPwLoading(false);
        return;
      }
      
      const { error } = await supabase.from('admin_settings').upsert({ key: 'admin_password', value: pwForm.newPw });
      if (error) throw error;
      
      setPwMsg({ text: '✅ Password updated! You will be logged out.', isError: false }); 
      setPwForm({ current: '', newPw: '', confirm: '' }); 
      setTimeout(() => { sessionStorage.removeItem('adminToken'); setAdminToken(null); }, 2000);
    } catch { setPwMsg({ text: 'Database error.', isError: true }); } finally { setPwLoading(false); }
  };

  const handleSaveDelivery = async () => {
    setDeliverySaving(true);
    setDeliveryMsg('');
    try {
      await supabase.from('admin_settings').upsert({ key: 'delivery_fee', value: String(deliverySettings.deliveryFee) });
      await supabase.from('admin_settings').upsert({ key: 'free_delivery_above', value: String(deliverySettings.freeAbove) });
      setDeliveryMsg('✅ Delivery settings saved!');
    } catch { setDeliveryMsg('Database error'); } finally { setDeliverySaving(false); setTimeout(() => setDeliveryMsg(''), 3000); }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountSaving(true);
    setAccountMsg({ text: '', isError: false });
    try {
      const { data: pwRaw } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
      const currentStored = pwRaw?.value || 'SuperAdmin123!';
      if (accountForm.password !== currentStored) {
        setAccountMsg({ text: 'Incorrect admin password', isError: true });
        return;
      }
      
      const upserts = [
        { key: 'mart_name', value: accountForm.name || '' },
        { key: 'mart_email', value: accountForm.email || '' },
        { key: 'mart_phone', value: accountForm.phone || '' }
      ];
      if (accountForm.username) upserts.push({ key: 'admin_username', value: accountForm.username.trim() });
      
      await supabase.from('admin_settings').upsert(upserts);
      setAccountMsg({ text: '✅ Account details saved successfully!', isError: false });
      setAccountForm(f => ({ ...f, password: '' }));
    } catch { setAccountMsg({ text: 'Database error', isError: true }); } 
    finally { setAccountSaving(false); setTimeout(() => setAccountMsg({ text: '', isError: false }), 4000); }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setPromoMsg({ text: '', isError: false });
    try {
      const promoData = { ...newPromo, code: newPromo.code.toUpperCase().trim(), active: true, createdAt: new Date().toISOString() };
      const key = `promo_${promoData.code}`;
      const { data: existing } = await supabase.from('admin_settings').select('key').eq('key', key).single();
      if (existing) {
        setPromoMsg({ text: 'Promo code already exists', isError: true });
        return;
      }
      
      const { error } = await supabase.from('admin_settings').insert({ key, value: JSON.stringify(promoData) });
      if (error) throw error;
      
      setPromoMsg({ text: `✅ Code "${promoData.code}" created!`, isError: false });
      setNewPromo({ code: randomCode(), discountType: 'percent', discountValue: 10, minOrder: 0, maxUses: 0, expiresAt: '' });
      fetchPromoCodes();
    } catch { setPromoMsg({ text: 'Database error', isError: true }); }
    setTimeout(() => setPromoMsg({ text: '', isError: false }), 4000);
  };

  const handleDeletePromo = async (code) => {
    if (!window.confirm(`Delete promo code "${code}"?`)) return;
    try {
      const key = `promo_${code.toUpperCase()}`;
      await supabase.from('admin_settings').delete().eq('key', key);
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
                                  <td className="px-3 py-2 font-medium">
                                    <div className="flex items-center gap-2">
                                      {item.image?.startsWith('http') ? (
                                        <img src={item.image} className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" alt="" />
                                      ) : (
                                        <span className="shrink-0">{item.image}</span>
                                      )}
                                      <span className="line-clamp-2 text-xs">{item.name}</span>
                                    </div>
                                  </td>
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
            <div className="flex gap-2">
              <button
                onClick={() => { setBulkStatus({ loading: false, msg: '', isError: false }); setShowBulkAdd(!showBulkAdd); setShowAddProduct(false); }}
                style={showBulkAdd
                  ? { background: '#4f46e5', border: '1.5px solid #4f46e5', color: '#fff' }
                  : { background: '#eef2ff', border: '1.5px solid #a5b4fc', color: '#4338ca' }
                }
                className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
              >
                <Plus size={16} /> Bulk Add (CSV)
              </button>
              <button onClick={() => {
                setNewProduct({ name: '', category: 'veg-fruits', price: '', mrp: '', image: '📦', unit: '1 pc', in_stock: true, is_fresh: false });
                setImageFile(null);
                setImagePreview(null);
                setShowBulkAdd(false);
                setShowAddProduct(true);
              }} className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-md">
                <Plus size={16} /> Add New Product
              </button>
            </div>
          </div>

          {showBulkAdd && (
            <div className="bg-white border-2 border-indigo-100 rounded-xl mb-8 shadow-md animate-fade-in overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">📋 Bulk Add Products via CSV</h3>
                  <p className="text-indigo-200 text-xs mt-0.5">Paste multiple products at once — one per line</p>
                </div>
                <button type="button" onClick={() => setShowBulkAdd(false)} className="text-indigo-200 hover:text-white font-bold text-lg leading-none transition-colors">✕</button>
              </div>

              <div className="p-6">
                {/* Format Guide */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">📌 Column Format (comma-separated)</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mb-3">
                    {['Name','Category','Price','MRP','Emoji/URL','Unit','In Stock','Fresh?'].map((col, i) => (
                      <div key={i} className="bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-center">
                        <span className="block text-[10px] font-bold text-indigo-400 uppercase">col {i+1}</span>
                        <span className="text-xs font-semibold text-indigo-800">{col}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white border border-dashed border-indigo-200 rounded-lg p-2.5 font-mono text-xs text-gray-600 leading-relaxed">
                    <span className="text-indigo-400">// Example rows:</span><br/>
                    Organic Apple, veg-fruits, 120, 150, 🍎, 1 kg, true, false<br/>
                    Full Cream Milk, dairy, 60, 65, 🥛, 1 L, true, false<br/>
                    Whole Wheat Bread, bakery, 45, 55, 🍞, 400 g, true, false
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-indigo-700">
                    <span>📂 Categories: <b>veg-fruits, dairy, bakery, cleaning, beverages, snacks, staples, frozen</b></span>
                    <span>✅ In Stock: <b>true</b> or <b>false</b></span>
                  </div>
                </div>

                {/* Textarea */}
                <form onSubmit={handleBulkSubmit}>
                  <div className="relative">
                    <textarea
                      required
                      rows={7}
                      value={bulkText}
                      onChange={e => setBulkText(e.target.value)}
                      className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mb-1 resize-y transition-colors"
                      placeholder={`Carrot, veg-fruits, 40, 50, 🥕, 500g, true, true\nMilk, dairy, 60, 65, 🥛, 1 L, true, false\nBread, bakery, 35, 45, 🍞, 200g, true, false`}
                    />
                    {bulkText.trim() && (
                      <div className="text-right text-xs text-indigo-600 font-semibold mb-3">
                        {bulkText.split('\n').filter(l => l.trim()).length} product(s) queued
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {bulkStatus.msg && (
                        <div className={`text-sm font-semibold flex items-center gap-2 px-4 py-2.5 rounded-lg ${bulkStatus.isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                          {bulkStatus.msg}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={bulkStatus.loading || !bulkText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      {bulkStatus.loading ? <><span className="animate-spin">⏳</span> Processing...</> : <><span>🚀</span> Parse &amp; Upload</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
                    <button onClick={() => handleDeleteProductClick(product.id)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1">
                      <Trash2 size={12} /> Delete
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
