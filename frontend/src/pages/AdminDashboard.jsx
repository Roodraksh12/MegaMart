import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Truck, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState(sessionStorage.getItem('adminToken') || null);
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'settings'
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  const { products, fetchProducts } = useStore();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', isError: false });
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ text: 'New passwords do not match.', isError: true }); return;
    }
    if (pwForm.newPw.length < 8) {
      setPwMsg({ text: 'New password must be at least 8 characters.', isError: true }); return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin-change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ text: '✅ Password updated! You will be logged out.', isError: false });
        setPwForm({ current: '', newPw: '', confirm: '' });
        setTimeout(() => {
          sessionStorage.removeItem('adminToken');
          setAdminToken(null);
        }, 2000);
      } else {
        setPwMsg({ text: data.error || 'Failed to update password.', isError: true });
      }
    } catch(err) {
      setPwMsg({ text: 'Network error. Try again.', isError: true });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem('adminToken', data.token);
        setAdminToken(data.token);
      } else {
        alert(data.error);
      }
    } catch(err) { console.error(err); }
  };

  async function fetchOrders() {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!res.ok) {
        if(res.status === 401 || res.status === 403) setAdminToken(null);
        return;
      }
      const data = await res.json();
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (adminToken) {
      fetchProducts();
      fetchOrders();
    }
  }, [fetchProducts, adminToken]);

  useEffect(() => {
    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (adminToken) {
          sessionStorage.removeItem('adminToken');
          setAdminToken(null);
        }
      }, 5 * 60 * 1000); // 5 minutes inactivity
    };

    if (adminToken) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer(); // Initialize timer
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [adminToken]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ status: newStatus })
      });
      setAllOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleToggleStock = async (productId, currentIsStocked) => {
    try {
      await fetch(`${API_URL}/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ in_stock: !currentIsStocked })
      });
      fetchProducts();
    } catch (err) {
      console.error("Failed to update stock", err);
    }
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

      // Upload image file if one was selected
      if (imageFile) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });

        const uploadRes = await fetch(`${API_URL}/api/admin/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify({ base64, fileName: imageFile.name, mimeType: imageFile.type })
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
        imageUrl = uploadData.url;
      }

      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
          ...newProduct,
          image: imageUrl,
          price: Number(newProduct.price),
          mrp: Number(newProduct.mrp)
        })
      });
      if (res.ok) {
        setShowAddProduct(false);
        setNewProduct({ name: '', category: 'veg-fruits', price: '', mrp: '', image: '📦', unit: '1 pc', in_stock: true, is_fresh: false });
        setImageFile(null);
        setImagePreview(null);
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch(err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-surface max-w-md w-full rounded-2xl p-8 shadow-xl text-center border border-gray-100">
           <span className="text-5xl">🔐</span>
           <h2 className="text-2xl font-display font-bold text-text-dark mt-6 mb-2">Admin Dashboard</h2>
           <p className="text-text-muted mb-8 text-sm">Enter the master password to securely access the store control center and inventory management.</p>
           <form onSubmit={handleLogin} className="space-y-4">
             <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-center tracking-widest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
             <button type="submit" className="w-full btn-primary py-3">Unlock Dashboard</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <span className="text-3xl mr-3">📦</span>
          <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-3">
            Store Control Center
          </h1>
          <p className="text-text-muted mt-1">Manage live incoming customer orders and expand stock seamlessly.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-orange-200 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            Live Secure Admin
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('adminToken');
              setAdminToken(null);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-text-dark px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-gray-200"
          >
            🔒 Lock Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('orders')}
          className={cn(
            "px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap",
            activeTab === 'orders' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-dark"
          )}
        >
          <span className="mr-2">🛒️</span> Orders ({allOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap",
            activeTab === 'inventory' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-dark"
          )}
        >
          <span className="mr-2">📦</span> Store Inventory ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap",
            activeTab === 'settings' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-dark"
          )}
        >
          <ShieldCheck size={15} className="mr-1" /> Security Settings
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="animate-fade-in space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-text-muted">Loading secure orders...</div>
          ) : allOrders.length === 0 ? (
            <div className="bg-surface rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <h3 className="text-xl font-bold text-text-dark mt-4">No orders yet</h3>
              <p className="text-text-muted">When a customer checks out, their order will magically appear here.</p>
            </div>
          ) : (
            allOrders.map(order => {
              let addr = {};
              try { addr = JSON.parse(order.delivery_address); } catch(e){}

              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gray-50 border-b border-gray-100 p-4 sm:px-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-lg">{order.id}</span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          order.status === 'Processing' ? "bg-orange-100 text-orange-700" :
                          order.status === 'Out for Delivery' ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-text-muted mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(order.created_at).toLocaleString()}</span>
                        <span className="font-medium text-text-dark">₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Status Flow Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === 'Processing' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1 whitespace-nowrap">
                          <Truck size={14} /> Dispatch Order
                        </button>
                      )}
                      {order.status === 'Out for Delivery' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg font-bold text-sm tracking-wide transition-colors flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <span className="text-sm text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle size={16} /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span className="text-base">📍</span> Customer & Delivery Info
                      </h4>
                      <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p><span className="text-gray-500">Name:</span> <b>{addr.name || 'N/A'}</b></p>
                        <p><span className="text-gray-500">Phone:</span> <b>{order.customer_phone || addr.phone || 'N/A'}</b></p>
                        <p><span className="text-gray-500">Address:</span> {addr.houseNo}, {addr.street}</p>
                        <p><span className="text-gray-500">Pincode:</span> {addr.pincode}</p>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded">Target: {addr.slot}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span className="text-base">🛒️</span> Order Contents
                      </h4>
                      <div className="text-sm border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                        {(order.items && order.items.length > 0) ? (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200 text-xs text-gray-400">
                                <th className="text-left px-3 py-2">Item</th>
                                <th className="text-center px-3 py-2">Qty</th>
                                <th className="text-right px-3 py-2">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                  <td className="px-3 py-2 font-medium">{item.image} {item.name}</td>
                                  <td className="px-3 py-2 text-center text-gray-500">&times;{item.quantity}</td>
                                  <td className="px-3 py-2 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 bg-gray-100">
                                <td colSpan={2} className="px-3 py-2 text-xs font-bold text-gray-500">Total</td>
                                <td className="px-3 py-2 text-right font-bold text-primary">₹{order.total_amount?.toFixed(2)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        ) : (
                          <p className="px-3 py-4 text-gray-400 text-center text-xs">No item details available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in max-w-lg">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <ShieldCheck size={20} className="text-primary" />
              <div>
                <h3 className="font-bold text-text-dark">Change Admin Password</h3>
                <p className="text-xs text-text-muted">Requires your current password to confirm identity</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPw.current ? 'text' : 'password'}
                    required
                    value={pwForm.current}
                    onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowPw(s => ({...s, current: !s.current}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPw.new ? 'text' : 'password'}
                    required
                    value={pwForm.newPw}
                    onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPw(s => ({...s, new: !s.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    required
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => setShowPw(s => ({...s, confirm: !s.confirm}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Message */}
              {pwMsg.text && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${pwMsg.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                  {pwMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {pwLoading ? 'Updating...' : <><ShieldCheck size={16} /> Update Password</>}
              </button>
            </form>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            ⚠️ After changing the password, you will be automatically logged out and must log in again with the new password.
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-center gap-3 text-sm flex-1">
              <span className="text-2xl mr-2">▶️</span>
              <p>Welcome to your live inventory! Toggle stock levels, or bring in new shipments.</p>
            </div>
            
            <button onClick={() => setShowAddProduct(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-md">
              <span className="text-xl">+</span> Add New Product
            </button>
          </div>

          {showAddProduct && (
            <div className="bg-white border-2 border-primary/20 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-text-dark flex items-center gap-2"><span>✨</span> Ship New Product</h3>
                <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕ Close</button>
              </div>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Name</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g., Organic Bananas" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border rounded p-2 text-sm bg-white">
                    <option value="veg-fruits">Vegetables & Fruits</option>
                    <option value="dairy">Dairy & Eggs</option>
                    <option value="bakery">Bakery & Bread</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="beverages">Beverages</option>
                    <option value="snacks">Snacks</option>
                    <option value="staples">Staples</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Selling Price (₹)</label>
                  <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="45" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">MRP (Original ₹)</label>
                  <input type="number" required value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="60" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Unit / Weight</label>
                  <input type="text" required value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g., 1 kg" />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold mb-1">Product Image</label>
                  <div className="flex items-center gap-3">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                      {imagePreview
                        ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        : <span className="text-2xl">{newProduct.image || '📦'}</span>
                      }
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer w-full flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg px-3 py-2 text-xs font-bold transition-colors">
                        📁 Choose Image File
                        <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Or type emoji/URL below</p>
                      <input type="text" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full border rounded p-1.5 text-xs mt-1" placeholder="📦 or emoji" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={newProduct.is_fresh} onChange={e => setNewProduct({...newProduct, is_fresh: e.target.checked})} className="w-4 h-4 text-primary" />
                    Mark as "Today's Fresh Pick"
                  </label>
                  <button type="submit" disabled={isUploading} className="btn-primary py-2 px-8 shadow-md disabled:opacity-60 flex items-center gap-2">
                    {isUploading ? <><span className="animate-spin">⏳</span> Uploading...</> : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className={cn(
                "border rounded-xl p-4 flex items-center gap-4 transition-all duration-300",
                product.inStock ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-300 opacity-60 grayscale"
              )}>
                <div className="text-4xl bg-gray-100 w-16 h-16 rounded-lg flex items-center justify-center border border-gray-200 shadow-inner overflow-hidden">
                  {product.image.startsWith('http') ? <img src={product.image} className="w-full h-full object-cover" alt="" /> : product.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-text-dark leading-tight line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{product.unit} • ₹{product.price}</p>
                  <div className="mt-2">
                    <button 
                      onClick={() => handleToggleStock(product.id, product.inStock)}
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-full transition-colors",
                         product.inStock 
                          ? "bg-green-100 text-green-700 hover:bg-green-200" 
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      )}
                    >
                      {product.inStock ? '✅ In Stock (Click to disable)' : '❌ Out of Stock (Click to restock)'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
