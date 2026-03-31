import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ChevronRight, ShoppingBag, Banknote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cart, getCartTotal, getCartSavings, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();

  const total = getCartTotal();
  const savings = getCartSavings();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
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
            className="fixed inset-0 bg-black z-50"
            onClick={toggleCart}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-surface">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary" />
                <h2 className="font-display font-bold text-xl text-text-dark">My Cart</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
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
                  <div key={item.id} className="flex gap-4 p-3 bg-surface rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 flex items-center justify-center bg-background rounded-lg text-4xl flex-shrink-0">
                      {item.image}
                    </div>
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
                        
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-background">
                          <button 
                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-medium text-sm bg-surface w-8 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-200 text-primary transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
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
              <div className="border-t border-gray-200 bg-surface p-4 space-y-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                {/* Total Calc */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Delivery Charge</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-text-dark pt-2 border-t border-dashed border-gray-200">
                    <span>To Pay</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>



                <div className="flex space-x-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full btn-primary flex justify-center items-center gap-2 py-3 rounded-xl shadow-lg shadow-primary/20"
                  >
                    Proceed to Checkout
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
