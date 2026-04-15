import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Banknote, ChevronRight, PackageCheck, Tag, X, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Checkout() {
  const { cart, getCartTotal, clearCart, user, toggleAuth, addOrder } = useStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState({
    name: user ? user.name : '',
    phone: user ? user.phone : '',
    houseNo: '',
    street: '',
    pincode: '',
    slot: 'Morning 7-11 AM'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery fee settings from backend
  const [deliveryConfig, setDeliveryConfig] = useState({ deliveryFee: 30, freeAbove: 150 });
  // (Removed API call, keeping defaults until we have a settings table)

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // null | { valid, code, discount, error }
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= deliveryConfig.freeAbove ? 0 : deliveryConfig.deliveryFee;
  const promoDiscount = promoStatus?.valid ? promoStatus.discount : 0;
  const total = subtotal + deliveryFee - promoDiscount;

  // If not logged in and cart not empty, show auth required or just let them checkout as guest?
  // Let's enforce login for checkout just like regular apps
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-3xl font-display font-bold">Please login to checkout</h2>
        <button onClick={toggleAuth} className="btn-primary">Login Now</button>
      </div>
    );
  }

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-3xl font-display font-bold">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Shop Now</button>
      </div>
    );
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoStatus(null);
    // Hardcoded simple validation since promo tables aren't in Supabase yet
    setTimeout(() => {
      if (promoInput.trim() === 'SUPER10' && subtotal >= 500) {
        setPromoStatus({ valid: true, code: 'SUPER10', discount: 50, discountValue: 50, discountType: 'fixed' });
      } else {
        setPromoStatus({ valid: false, error: 'Invalid or expired promo code' });
      }
      setPromoLoading(false);
    }, 500);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // 1. Insert Order
      const { error: orderError } = await supabase.from('orders').insert({
        id: newOrderId,
        user_id: user.id,
        total_amount: total,
        status: 'Processing',
        payment_method: paymentMethod.toUpperCase(),
        delivery_address: JSON.stringify(address)
      });
      if (orderError) throw orderError;

      // 2. Insert Order Items
      const orderItemsData = cart.map(item => ({
        id: `item-${Math.floor(Math.random() * 9999999)}`,
        order_id: newOrderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
      if (itemsError) throw itemsError;
      
      const order = {
        id: newOrderId,
        date: new Date().toISOString(),
        items: [...cart],
        total,
        status: 'Processing',
        address
      };
      
      addOrder(order);
      clearCart();
      setIsProcessing(false);
      setStep(4);
    } catch (error) {
      console.error('Failed to submit order', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Steps Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto relative">
           <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
           <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
           
           {[
             { id: 1, label: 'Delivery', icon: Truck },
             { id: 2, label: 'Review', icon: PackageCheck },
             { id: 3, label: 'Payment', icon: CreditCard }
           ].map(s => (
             <div key={s.id} className="flex flex-col items-center gap-2">
               <div className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors bg-white",
                 step >= s.id ? "border-primary text-primary" : "border-gray-200 text-gray-400"
               )}>
                 {step > s.id ? <CheckCircle size={20} /> : <s.icon size={20} />}
               </div>
               <span className={cn("text-xs font-semibold", step >= s.id ? "text-primary" : "text-gray-400")}>{s.label}</span>
             </div>
           ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-surface-container-low rounded-3xl shadow-ambient p-6 sm:p-8">
        
        {/* Step 1: Delivery */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display font-bold text-2xl mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Full Name</label>
                 <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-xl p-3.5 text-sm font-body focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Phone Number</label>
                 <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-xl p-3.5 text-sm font-body focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">House/Flat No.</label>
                 <input type="text" value={address.houseNo} onChange={e => setAddress({...address, houseNo: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-xl p-3.5 text-sm font-body focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Pincode</label>
                 <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-xl p-3.5 text-sm font-body focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium mb-1">Street / Landmark</label>
                 <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-xl p-3.5 text-sm font-body focus:ring-1 focus:ring-primary focus:outline-none" />
               </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-medium mb-3">Select Delivery Slot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Morning 7-11 AM', 'Afternoon 12-4 PM', 'Evening 5-9 PM'].map(slot => (
                  <button 
                    key={slot}
                    onClick={() => setAddress({...address, slot})}
                    className={cn(
                      "p-3 rounded-lg border text-sm text-center transition-all",
                      address.slot === slot ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" : "border-gray-200 hover:border-primary/50 text-text-muted"
                    )}
                  >
                    {slot}
                    {slot === 'Evening 5-9 PM' && <span className="block text-[10px] text-red-500 mt-1">Few slots left!</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(2)} className="btn-primary py-3 px-8 flex items-center gap-2">
                Continue to Review <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display font-bold text-2xl mb-4">Order Review</h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                   <div className="flex items-center gap-3">
                     <span className="text-2xl">{item.image}</span>
                     <div>
                       <p className="font-medium text-sm">{item.name}</p>
                       <p className="text-xs text-text-muted">{item.quantity} x ₹{item.price}</p>
                     </div>
                   </div>
                   <div className="font-bold">₹{item.quantity * item.price}</div>
                 </div>
               ))}
            </div>
            
            <div className="flex justify-between items-center py-4 border-b border-dashed border-gray-200">
               <span className="text-text-muted">Delivery to: <b>{address.houseNo}, {address.street}</b></span>
               <button onClick={() => setStep(1)} className="text-primary text-sm font-bold hover:underline">Change</button>
            </div>

            <div className="flex justify-end space-y-2 flex-col items-end pt-4">
               <div className="flex justify-between w-full max-w-xs text-sm text-text-muted">
                 <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between w-full max-w-xs text-sm text-text-muted">
                 <span>Delivery</span>
                 <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                   {deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}
                 </span>
               </div>
               {deliveryFee > 0 && (
                 <p className="text-xs text-gray-400 w-full max-w-xs text-right">Add ₹{(deliveryConfig.freeAbove - subtotal).toFixed(0)} more for free delivery</p>
               )}
               {promoStatus?.valid && (
                 <div className="flex justify-between w-full max-w-xs text-sm text-green-600">
                   <span className="flex items-center gap-1"><Tag size={12} /> {promoStatus.code}</span>
                   <span>- ₹{promoStatus.discount}</span>
                 </div>
               )}
               <div className="flex justify-between w-full max-w-xs text-xl font-bold mt-2 pt-2 border-t border-gray-200">
                 <span>Total</span><span className="text-primary">₹{total.toFixed(2)}</span>
               </div>
            </div>

            {/* Promo Code */}
            <div className="pt-4 border-t border-dashed border-gray-100 mt-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Have a promo code?</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(null); }}
                    placeholder="e.g. SUPER10"
                    className="w-full border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-sm font-mono uppercase focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                {promoStatus?.valid ? (
                  <button type="button" onClick={() => { setPromoStatus(null); setPromoInput(''); }} className="px-4 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
                    <X size={13} /> Remove
                  </button>
                ) : (
                  <button type="button" onClick={handleApplyPromo} disabled={promoLoading || !promoInput.trim()} className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50">
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {promoStatus && !promoStatus.valid && (
                <p className="text-xs text-red-500 mt-1.5">{promoStatus.error}</p>
              )}
              {promoStatus?.valid && (
                <p className="text-xs text-green-600 mt-1.5 font-medium">✅ {promoStatus.discountType === 'percent' ? `${promoStatus.discountValue}%` : `₹${promoStatus.discountValue}`} discount applied!</p>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-outline py-3 px-8">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary py-3 px-8 flex items-center gap-2">
                Continue to Payment <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display font-bold text-2xl mb-4">Payment</h2>

            {/* COD Only Panel */}
            <div className="flex flex-col items-center justify-center bg-green-50 border-2 border-green-100 rounded-2xl p-10 gap-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Banknote size={40} />
              </div>
              <p className="text-xl font-bold text-gray-800">Cash on Delivery (COD)</p>
              <p className="text-sm text-text-muted text-center max-w-sm">Pay in cash or via UPI / QR code at the time of delivery. Please keep exact change ready.</p>
              <span className="text-xs bg-green-600 text-white font-bold px-4 py-1.5 rounded-full">Only Available Payment Method</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-6">
              <button onClick={() => setStep(2)} className="btn-outline py-3 px-8" disabled={isProcessing}>Back</button>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={cn(
                  "btn-primary py-3 px-8 flex items-center justify-center gap-2 min-w-[200px]",
                  isProcessing && "opacity-70 cursor-wait"
                )}
              >
                {isProcessing ? 'Processing...' : `Confirm Order ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Order Confirmed + Printable Invoice */}
        {step === 4 && (
          <div className="animate-fade-in">
            {/* Success Header */}
            <div className="text-center py-8 space-y-3">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce-soft">
                <CheckCircle size={44} />
              </div>
              <h2 className="text-3xl font-display font-bold text-text-dark">Order Confirmed! 🎉</h2>
              <p className="text-text-muted">Your order will be delivered during <b>{address.slot}</b>.</p>
            </div>

            {/* Printable Invoice */}
            <div id="invoice-section" className="border-2 border-dashed border-gray-200 rounded-2xl p-6 mt-2 max-w-lg mx-auto bg-gray-50">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-display font-bold text-primary">SuperMart</h3>
                  <p className="text-xs text-gray-400">Fresh from the shelves</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Tax Invoice / Receipt</p>
                  <p className="text-xs font-bold text-text-dark mt-1">{orderId}</p>
                  <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4 text-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deliver To</p>
                <p className="font-semibold">{address.name}</p>
                <p className="text-gray-500">{address.houseNo}, {address.street}</p>
                <p className="text-gray-500">Pincode: {address.pincode}</p>
                <p className="text-gray-500">Phone: {address.phone}</p>
                <div className="mt-1">
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">Slot: {address.slot}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(useStore.getState().orders[0]?.items || []).map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 font-medium">{item.image} {item.name}</td>
                      <td className="py-2 text-center text-gray-500">×{item.quantity}</td>
                      <td className="py-2 text-right text-gray-500">₹{item.price}</td>
                      <td className="py-2 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1 text-sm border-t border-gray-200 pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                {promoStatus?.valid && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({promoStatus.code})</span>
                    <span>- ₹{promoStatus.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200 mt-1">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs text-gray-400">Payment Method</span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">💵 Cash on Delivery (COD)</span>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">Thank you for shopping with SuperMart! ❤️</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button
                onClick={() => window.print()}
                className="btn-outline py-2.5 px-6 flex items-center justify-center gap-2 text-sm"
              >
                🖨️ Print Invoice
              </button>
              <button onClick={() => navigate('/orders')} className="btn-secondary py-2.5 px-6 text-sm">Track Order</button>
              <button onClick={() => navigate('/')} className="btn-primary py-2.5 px-6 text-sm">Continue Shopping</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
