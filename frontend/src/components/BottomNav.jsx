import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket, Grid } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const { getCartItemCount, toggleCart } = useStore();
  const location = useLocation();
  const cartCount = getCartItemCount();
  const isAdmin = location.pathname.startsWith('/admin');
  const isProductPage = location.pathname.startsWith('/product/');

  if (isAdmin || isProductPage) return null;

  const links = [
    { to: '/',         icon: Home,          label: 'Home'    },
    { to: '/wishlist', icon: Heart,         label: 'Saved'   },
    { to: '/orders',   icon: ClipboardList, label: 'Orders'  },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40
                    bg-white/40 backdrop-blur-2xl border border-white/60 shadow-inner shadow-[0_8px_32px_rgba(0,0,0,0.1)]
                    rounded-full
                    py-1">
      <div className="flex items-center justify-around px-2 h-[60px]">

        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200',
                active
                  ? 'text-primary bg-white/50 shadow-sm border border-white/40'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/30'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span className="font-label text-[10px] font-bold uppercase tracking-widest">
                {label}
              </span>
            </Link>
          );
        })}

        {/* Cart */}
        <button
          onClick={toggleCart}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl
                     text-on-surface-variant hover:text-on-surface hover:bg-white/30
                     transition-all duration-200 relative"
        >
          <span className="relative">
            <ShoppingBasket size={22} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary
                               text-[9px] font-bold w-4 h-4 rounded-full
                               flex items-center justify-center shadow-ambient">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </span>
          <span className="font-label text-[10px] font-bold uppercase tracking-widest">Cart</span>
        </button>

      </div>
    </nav>
  );
}
