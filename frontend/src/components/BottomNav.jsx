import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ClipboardList, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const { getCartItemCount, toggleCart, toggleAuth, user } = useStore();
  const location = useLocation();
  const cartCount = getCartItemCount();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const links = [
    { to: '/',         icon: Home,          label: 'Home' },
    { to: '/wishlist', icon: Heart,         label: 'Saved' },
    { to: '/orders',   icon: ClipboardList, label: 'Orders' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/10 pt-1 pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className="flex items-center justify-around h-[60px] px-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px]',
                active ? 'text-black' : 'text-gray-400 hover:text-black'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}

        {/* Cart button — centre-right */}
        <button
          onClick={toggleCart}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-gray-400 hover:text-black relative min-w-[56px] transition-colors"
        >
          <span className="relative">
            <ShoppingCart size={22} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </span>
          <span className="text-[10px] font-semibold">Cart</span>
        </button>
      </div>
    </nav>
  );
}
