import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ChevronRight, ShoppingBag, Tag, CheckCircle, XCircle, Loader, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cart, getCartTotal, getCartSavings, updateQuantity, removeFromCart, addToast } = useStore();
  const navigate = useNavigate();

  const total = getCartTotal();
  const savings = getCartSavings();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Delivery settings from backend
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [freeAbove, setFreeAbove] = useState(150);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('admin_settings').select('key, value').in('key', ['delivery_fee', 'free_delivery_above']);
        const settings = {};
        (data || []).forEach(row => { settings[row.key] = row.value; });
        if (settings.delivery_fee) setDeliveryFee(Number(settings.delivery_fee));
        if (settings.free_delivery_above) setFreeAbove(Number(settings.free_delivery_above));
      } catch (err) {}
    };
    fetchSettings();
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
      const key = `promo_${promoCode.toUpperCase().trim()}`;
      const { data } = await supabase.from('admin_settings').select('value').eq('key', key).single();
      
      if (!data) {
        setPromoStatus('error');
        setPromoError('Invalid promo code');
        setAppliedPromo(null);
        return;
      }
      
      const promo = JSON.parse(data.value);
      if (!promo.active) { setPromoStatus('error'); setPromoError('This promo code is inactive'); return; }
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) { setPromoStatus('error'); setPromoError('Promo code has expired'); return; }
      if (promo.minOrder && total < promo.minOrder) { setPromoStatus('error'); setPromoError(`Minimum order ₹${promo.minOrder} required`); return; }
      if (promo.maxUses && promo.usedCount >= promo.maxUses) { setPromoStatus('error'); setPromoError('Promo code usage limit reached'); return; }
      
      const discount = promo.discountType === 'percent'
        ? Math.round((promo.discountValue / 100) * total)
        : promo.discountValue;

      const promoData = { valid: true, code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue, discount };
      setAppliedPromo(promoData);
      setPromoStatus('success');
      addToast({ message: `Promo applied! You save ₹${discount}`, type: 'success' });
    } catch {
      setPromoStatus('error');
      setPromoError('Could not validate code. Try again.');
      setAppliedPromo(null);
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
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
            onClick={toggleCart}
          />
          
          {/* Drawer — "The Harvest Drawer" */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ willChange: "transform" }}
            className="fixed top-2 bottom-2 right-2 sm:right-4 h-[calc(100dvh-16px)] w-[calc(100%-16px)] sm:w-[420px] glass-panel z-50 flex flex-col shadow-ambient-lg rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary" size={20} strokeWidth={1.8} />
                <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">Your Basket</h2>
                <span className="chip bg-surface-container text-on-surface-variant ml-1">
                  {cart.length}
                </span>
              </div>
              <button 
                onClick={toggleCart} 
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Savings Banner */}
            {savings > 0 && (
              <div className="bg-secondary-container px-4 py-2.5 flex items-center justify-center gap-2">
                <span className="text-lg">🎉</span>
                <p className="text-sm font-body font-semibold text-on-secondary-container">
                  You're saving <span className="font-bold">₹{savings.toFixed(2)}</span> on this order!
                </p>
              </div>
            )}

            {/* Delivery progress bar */}
            {cart.length > 0 && (
              <div className="px-6 py-4 bg-white/40 border-b border-white/20">
                {isDeliveryFree ? (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle size={15} className="flex-shrink-0" />
                    <p className="text-[11px] font-bold font-label uppercase tracking-widest">Free Delivery Unlocked</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-on-surface-variant mb-2 font-label font-bold uppercase tracking-widest">
                    Add <span className="text-on-surface font-bold">₹{amountToFreeDelivery}</span> for <span className="text-primary font-bold">Free Delivery</span>
                  </p>
                )}
                <div className="h-1 bg-surface-container-high w-full mt-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <ShoppingBag size={56} className="text-outline mb-2" strokeWidth={1} />
                  <h3 className="text-xl font-headline font-bold text-on-surface">Your pantry is empty</h3>
                  <p className="text-on-surface-variant font-body text-sm">Add some fresh picks to get started.</p>
                  <button 
                    onClick={toggleCart}
                    className="mt-2 btn-secondary"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/60 hover:bg-white/80 border border-white/50 rounded-xl transition-all shadow-sm">
                    <Link to={`/product/${item.id}`} onClick={toggleCart} className="w-18 h-20 min-w-[72px] flex items-center justify-center bg-white/50 rounded-xl flex-shrink-0">
                      {item.image?.startsWith('http')
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-xl p-2" />
                        : <span className="text-3xl">{item.image}</span>}
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-2 leading-tight">{item.name}</h4>
                          <span className="text-xs text-on-surface-variant font-body">{item.unit}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-outline hover:text-error transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface text-sm">₹{item.price}</span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-on-surface-variant line-through">₹{item.mrp}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-1">
                          <button 
                            className="text-on-surface hover:text-primary transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={13} strokeWidth={2} />
                          </button>
                          <span className="text-xs font-bold text-on-surface w-4 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            className="text-on-surface hover:text-primary transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={13} strokeWidth={2} />
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
              <div className="border-t border-white/30 bg-white/40 p-6 space-y-4">

                {/* Promo Code Input */}
                <div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-primary-container rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-primary" />
                        <span className="text-sm font-bold text-on-primary-container">{appliedPromo.code}</span>
                        <span className="text-xs text-on-primary-container/70">− ₹{appliedPromo.discount} off</span>
                      </div>
                      <button onClick={removePromo} className="text-on-primary-container/50 hover:text-error transition-colors" aria-label="Remove promo">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoStatus(null); }}
                          onKeyDown={e => e.key === 'Enter' && applyPromo()}
                          className="w-full pl-8 pr-3 py-2.5 text-[16px] sm:text-sm bg-white/50 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-on-surface placeholder:text-outline"
                        />
                      </div>
                      <button
                        onClick={applyPromo}
                        disabled={promoStatus === 'loading' || !promoCode.trim()}
                        className="btn-primary px-4 py-2 text-sm rounded-xl disabled:opacity-50 flex items-center gap-1 active:scale-95"
                      >
                        {promoStatus === 'loading' ? <Loader size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoStatus === 'error' && (
                    <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                      <XCircle size={11} /> {promoError}
                    </p>
                  )}
                </div>

                {/* Bill summary */}
                <div className="space-y-2 bg-white/60 border border-white/50 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between text-sm text-on-surface-variant font-body">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-primary font-semibold">
                      <span>Promo ({appliedPromo.code})</span>
                      <span>− ₹{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-on-surface-variant font-body">
                    <span>Delivery</span>
                    {isDeliveryFree
                      ? <span className="text-primary font-semibold">FREE</span>
                      : <span>₹{deliveryFee.toFixed(2)}</span>
                    }
                  </div>
                  <div className="flex justify-between text-lg font-headline font-bold text-on-surface pt-2 border-t border-surface-container">
                    <span>To Pay</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full btn-primary flex justify-center items-center gap-2 py-3.5 rounded-xl"
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
