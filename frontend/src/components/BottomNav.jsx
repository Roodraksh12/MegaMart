import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { getCartItemCount, toggleCart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();
  const isAdmin = location.pathname.startsWith('/admin');
  const isProductPage = location.pathname.startsWith('/product/');

  const tabs = [
    { id: 'home', to: '/', icon: Home, label: 'Home' },
    { id: 'saved', to: '/wishlist', icon: Heart, label: 'Saved' },
    { id: 'orders', to: '/orders', icon: ClipboardList, label: 'Orders' },
    { id: 'cart', action: toggleCart, icon: ShoppingBasket, label: 'Cart', badge: cartCount }
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Sync active tab with current route
  useEffect(() => {
    const currentTab = tabs.find(t => t.to === location.pathname);
    if (currentTab) setActiveTab(currentTab.id);
  }, [location.pathname]);

  // Handle Swipe/Pan to switch tabs
  const handlePanEnd = (e, info) => {
    const swipeThreshold = 40;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      
      if (info.offset.x < -swipeThreshold && currentIndex < tabs.length - 1) {
        // Swiped Left -> Move to Next Tab
        const nextTab = tabs[currentIndex + 1];
        setActiveTab(nextTab.id);
        if (nextTab.action) nextTab.action();
        else navigate(nextTab.to);
      } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
        // Swiped Right -> Move to Previous Tab
        const prevTab = tabs[currentIndex - 1];
        setActiveTab(prevTab.id);
        if (prevTab.action) prevTab.action();
        else navigate(prevTab.to);
      }
    }
  };

  if (isAdmin || isProductPage) return null;

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 flex items-center justify-center pointer-events-none">
      
      {/* WhatsApp Style Dock Container */}
      <motion.div 
        onPanEnd={handlePanEnd}
        className="relative flex items-center justify-between pointer-events-auto bg-[#F2F2F7]/95 backdrop-blur-xl border border-black/5 p-2 rounded-full shadow-lg touch-none w-full max-w-[400px]"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.action) tab.action();
                else navigate(tab.to);
              }}
              className="relative flex flex-col items-center justify-center flex-1 h-[60px] rounded-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Sliding Dark Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="whatsappPill"
                  className="absolute inset-0 bg-black/[0.08] rounded-full z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Vertically Stacked Icon and Text */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-1 mt-1">
                <div className="relative">
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 1.8} 
                    className={cn(
                      "transition-colors duration-300", 
                      isActive ? "text-gray-900" : "text-gray-500"
                    )}
                  />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={cn(
                    "font-medium text-[10px] tracking-wide transition-colors duration-300",
                    isActive ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>
    </nav>
  );
}
