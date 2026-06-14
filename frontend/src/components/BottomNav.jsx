import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

// SVG Filter Component to create true optical glass refraction & distortion
const OpticalRefractionFilter = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
    <defs>
      <filter id="optical-refraction" x="-20%" y="-20%" width="140%" height="140%">
        {/* Subtle noise for real glass imperfection */}
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
        {/* Displace the background using the noise to create physical optical refraction */}
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        {/* Soft edge blur simulating optical depth of field */}
        <feGaussianBlur in="displaced" stdDeviation="0.5" result="blurred" />
      </filter>
    </defs>
  </svg>
);

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

  if (isAdmin || isProductPage) return null;

  return (
    <>
      <OpticalRefractionFilter />
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 optical-nav-dock rounded-full h-[70px] flex items-center px-1.5">
        <div className="relative flex items-center justify-around w-full h-full">
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
                className="relative z-10 flex flex-col items-center justify-center w-full h-full"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* ── The Floating Optical Lens ── */}
                {isActive && (
                  <motion.div
                    layoutId="opticalLens"
                    className="absolute inset-0 optical-lens z-0 my-1.5 mx-1"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.8
                    }}
                  />
                )}

                {/* ── Magnified Content Inside Lens ── */}
                <motion.div 
                  className="relative z-10 flex flex-col items-center gap-1"
                  animate={{ 
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                >
                  <span className="relative">
                    <Icon 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 1.8} 
                      className={cn(
                        "transition-colors duration-300", 
                        isActive ? "text-primary drop-shadow-sm" : "text-on-surface-variant"
                      )}
                    />
                    {tab.badge > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-elevated"
                      >
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </motion.span>
                    )}
                  </span>
                  
                  <motion.span 
                    animate={{ 
                      opacity: isActive ? 1 : 0.6,
                      y: isActive ? 0 : 2
                    }}
                    className={cn(
                      "font-label text-[10px] font-bold uppercase tracking-widest transition-colors duration-300", 
                      isActive ? "text-primary" : "text-on-surface-variant"
                    )}
                  >
                    {tab.label}
                  </motion.span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
