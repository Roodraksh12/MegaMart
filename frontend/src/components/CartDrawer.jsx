import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ChevronRight, ShoppingBag, Tag, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cart, getCartTotal, getCartSavings, updateQuantity, removeFromCart, addToast } = useStore();
  const navigate = useNavigate();

  const total = getCartTotal();
  const savings = getCartSavings();

  // Delivery settings from backend
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [freeAbove, setFreeAbove] = useState(150);
  useEffect(() => {
    fetch(`${API_URL}/api/settings/delivery`)
      .then(r => r.json())
      .then(d => { setDeliveryFee(d.deliveryFee ?? 30); setFreeAbove(d.freeAbove ?? 150); })
      .catch(() => {});
  }, []);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // null | 'loading' | {discount, code, type} | 'error'
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoStatus('loading');
    setPromoError('');
    try {
      const res = await fetch(`${API_URL}/api/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), orderTotal: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoStatus('error');
        setPromoError(data.error || 'Invalid promo code');
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoStatus('success');
        addToast({ message: `Promo applied! You save ₹${data.discount}`, type: 'success' });
      }
    } catch {
      setPromoStatus('error');
      setPromoError('Could not validate code. Try again.');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoStatus(null);
    setPromoCode('');
    setPromoError('');
  };

  // Computed totals
  const promoDiscount = appliedPromo?.discount ?? 0;
  const isDeliveryFree = total >= freeAbove;
  const effectiveDeliveryFee = isDeliveryFree ? 0 : deliveryFee;
  const amountToFreeDelivery = Math.max(0, freeAbove - total);
  const progressPercent = Math.min(100, (total / freeAbove) * 100);
  const grandTotal = Math.max(0, total + effectiveDeliveryFee - promoDiscount);

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout', { state: { appliedPromo } });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50"
            onClick={toggleCart}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white/40 backdrop-blur-3xl border-l border-white/60 shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/20">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-black" />
                <h2 className="font-display font-bold text-xl text-black">My Cart</h2>
                <span className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {cart.length} items
                </span>
              </div>
              <button 
                onClick={toggleCart} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Savings Banner */}
            {savings > 0 && (
              <div className="bg-green-50 border-b border-green-100 p-2 flex items-center justify-center gap-2">
                <span className="text-xl">🎉</span>
                <p className="text-sm font-medium text-green-700">
                  You're saving <span className="font-bold border-b border-green-700">₹{savings.toFixed(2)}</span> on this order!
                </p>
              </div>
            )}

            {/* Delivery progress bar */}
            {cart.length > 0 && (
              <div className="px-4 py-3 bg-white/30 border-b border-white/20">
                {isDeliveryFree ? (
                  <div className="flex items-center gap-2 text-black">
                    <CheckCircle size={15} className="flex-shrink-0" />
                    <p className="text-xs font-bold">🎊 You've unlocked FREE delivery!</p>
                  </div>
                ) : (
                  <p className="text-xs text-text-dark mb-1.5 font-medium">
                    Add <span className="font-bold text-black">₹{amountToFreeDelivery}</span> more for <span className="font-bold text-black">FREE delivery</span>
                  </p>
                )}
                <div className="h-1 bg-white/50 rounded-full overflow-hidden mt-1 shadow-inner">
                  <motion.div
                    className="h-full bg-black rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-text-muted opacity-60">
                  <ShoppingBag size={64} className="mb-4" />
                  <h3 className="text-xl font-medium text-text-dark hidden sm:block">Your cart is empty</h3>
                  <p>Looks like you haven't made your choice yet...</p>
                  <button 
                    onClick={toggleCart}
                    className="mt-6 btn-outline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-white/40 rounded-3xl border border-white/50 shadow-glass backdrop-blur-md">
                    <Link to={`/product/${item.id}`} onClick={toggleCart} className="w-16 h-16 flex items-center justify-center bg-white/40 rounded-2xl text-4xl flex-shrink-0 border border-white/30">
                      {item.image?.startsWith('http')
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                        : item.image}
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm text-text-dark line-clamp-2 leading-tight">{item.name}</h4>
                          <span className="text-xs text-text-muted">{item.unit}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-text-dark">₹{item.price}</span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-text-muted line-through">₹{item.mrp}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center border border-black/10 rounded-full overflow-hidden bg-black/5 shadow-inner">
                          <button 
                            className="px-2 py-1.5 flex items-center justify-center hover:bg-black hover:text-white transition-all font-bold"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="px-3 py-1 font-bold text-sm w-8 text-center bg-transparent">
                            {item.quantity}
                          </span>
                          <button 
                            className="px-2 py-1.5 flex items-center justify-center hover:bg-black hover:text-white transition-all font-bold"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-white/30 bg-white/30 backdrop-blur-xl p-4 space-y-3 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)]">

                {/* Promo Code Input */}
                <div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-600" />
                        <span className="text-sm font-bold text-green-700">{appliedPromo.code}</span>
                        <span className="text-xs text-green-600">− ₹{appliedPromo.discount} off</span>
                      </div>
                      <button onClick={removePromo} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoStatus(null); }}
                          onKeyDown={e => e.key === 'Enter' && applyPromo()}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50 focus:bg-white transition-all"
                        />
                      </div>
                      <button
                        onClick={applyPromo}
                        disabled={promoStatus === 'loading' || !promoCode.trim()}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-1 active:scale-95 shadow-soft"
                      >
                        {promoStatus === 'loading' ? <Loader size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoStatus === 'error' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle size={11} /> {promoError}
                    </p>
                  )}
                </div>

                {/* Bill summary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Promo ({appliedPromo.code})</span>
                      <span>− ₹{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Delivery</span>
                    {isDeliveryFree
                      ? <span className="text-green-600 font-medium">FREE</span>
                      : <span>₹{deliveryFee.toFixed(2)}</span>
                    }
                  </div>
                  <div className="flex justify-between text-lg font-bold text-text-dark pt-2 border-t border-dashed border-gray-200">
                    <span>To Pay</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full btn-primary flex justify-center items-center gap-2 py-3 rounded-xl shadow-lg shadow-primary/20"
                >
                  Proceed to Checkout
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
