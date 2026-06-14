import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

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
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 optical-nav-dock h-[64px] flex items-center justify-center pointer-events-none">
        
        {/* Center Container */}
        <motion.div layout className="flex items-center gap-1.5 pointer-events-auto bg-white/30 backdrop-blur-sm border border-white/40 p-1.5 rounded-full shadow-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                layout
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.action) tab.action();
                  else navigate(tab.to);
                }}
                className={cn(
                  "relative z-10 flex items-center justify-center gap-2 h-[52px] rounded-full",
                  isActive ? "px-6" : "w-[52px]"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* ── The Floating Optical Lens ── */}
                {isActive && (
                  <motion.div
                    layoutId="opticalLens"
                    className="absolute inset-0 optical-lens z-0 rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.8
                    }}
                  />
                )}

                {/* ── Content Inside Lens ── */}
                <motion.div 
                  layout
                  className="relative z-10 flex items-center gap-2"
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                >
                  <span className="relative flex-shrink-0">
                    <Icon 
                      size={22} 
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
                        className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-elevated"
                      >
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </motion.span>
                    )}
                  </span>
                  
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="font-label text-[11px] font-bold uppercase tracking-widest text-primary whitespace-nowrap overflow-hidden"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>
      </nav>
    </>
  );
}
