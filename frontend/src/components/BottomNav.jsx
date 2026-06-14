import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon as HomeOutline, HeartIcon as HeartOutline, ClipboardDocumentListIcon as OrdersOutline, ShoppingBagIcon as CartOutline } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, HeartIcon as HeartSolid, ClipboardDocumentListIcon as OrdersSolid, ShoppingBagIcon as CartSolid } from '@heroicons/react/24/solid';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function BottomNav() {
  const { getCartItemCount, toggleCart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();
  const isAdmin = location.pathname.startsWith('/admin');
  const isProductPage = location.pathname.startsWith('/product/');

  const tabs = [
    { id: 'home', to: '/', iconOutline: HomeOutline, iconSolid: HomeSolid, label: 'Home' },
    { id: 'saved', to: '/wishlist', iconOutline: HeartOutline, iconSolid: HeartSolid, label: 'Saved' },
    { id: 'orders', to: '/orders', iconOutline: OrdersOutline, iconSolid: OrdersSolid, label: 'Orders' },
    { id: 'cart', action: toggleCart, iconOutline: CartOutline, iconSolid: CartSolid, label: 'Cart', badge: cartCount }
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  const progress = useMotionValue(0);

  useEffect(() => {
    const idx = tabs.findIndex(t => t.to === location.pathname);
    if (idx !== -1 && idx !== activeIndex) {
      setActiveTab(tabs[idx].id);
      animate(progress, idx, { type: "spring", stiffness: 400, damping: 32 });
    }
  }, [location.pathname]);

  useEffect(() => {
    progress.set(activeIndex);
  }, []);

  const DRAG_STEP_PX = 58;
  const startProgress = useMotionValue(0);

  const handlePanStart = () => startProgress.set(progress.get());

  const handlePan = (e, info) => {
    const rawNewProgress = startProgress.get() + (info.offset.x / DRAG_STEP_PX);
    progress.set(Math.max(0, Math.min(3, rawNewProgress)));
  };

  const handlePanEnd = (e, info) => {
    const momentumProgress = progress.get() + (info.velocity.x / 1000); 
    const closestIndex = Math.max(0, Math.min(3, Math.round(momentumProgress)));
    
    setActiveTab(tabs[closestIndex].id);
    animate(progress, closestIndex, { type: "spring", stiffness: 450, damping: 32 });

    const tabObj = tabs[closestIndex];
    if (tabObj.action) tabObj.action();
    else navigate(tabObj.to);
  };

  const lensLeft = useTransform(progress, 
    [0, 0.5, 1, 1.5, 2, 2.5, 3], 
    [6,   6,  64,  64, 122, 122, 180]
  );
  const lensWidth = useTransform(progress, 
    [0, 0.5,  1, 1.5,  2, 2.5,  3], 
    [110, 168, 110, 168, 110, 168, 110]
  );

  if (isAdmin || isProductPage) return null;

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 h-[64px] flex items-center justify-center pointer-events-none">
      
      {/* Transparent Track Wrapper */}
      <motion.div 
        onPanStart={handlePanStart}
        onPan={handlePan} 
        onPanEnd={handlePanEnd}
        className="relative flex items-center gap-[6px] pointer-events-auto bg-white/30 backdrop-blur-sm border border-white/40 p-[6px] rounded-full shadow-lg touch-none"
        style={{ width: 296, height: 64 }}
      >
        {/* ── Native iOS Frosted Glass Lens (z-20) ── */}
        <motion.div
          className="absolute top-[6px] bottom-[6px] optical-lens z-20 rounded-full pointer-events-none"
          style={{ left: lensLeft, width: lensWidth }}
        />

        {/* ── Tab Items ── */}
        {tabs.map((tab, i) => (
          <TabItem 
            key={tab.id} 
            tab={tab} 
            index={i} 
            progress={progress} 
            onClick={() => {
              setActiveTab(tab.id);
              animate(progress, i, { type: "spring", stiffness: 450, damping: 32 });
              if (tab.action) tab.action();
              else navigate(tab.to);
            }}
          />
        ))}
      </motion.div>
    </nav>
  );
}

function TabItem({ tab, index, progress, onClick }) {
  const IconOutline = tab.iconOutline;
  const IconSolid = tab.iconSolid;

  const widthRange = [0, 1, 2, 3].map(i => i === index ? 110 : 52);
  const tabWidth = useTransform(progress, [0, 1, 2, 3], widthRange);

  const opacityRange = [0, 1, 2, 3].map(i => i === index ? 1 : 0);
  const textOpacity = useTransform(progress, [0, 1, 2, 3], opacityRange);
  const inverseOpacity = useTransform(textOpacity, v => 1 - v);

  return (
    <motion.button
      onClick={onClick}
      style={{ width: tabWidth }}
      className="relative flex items-center justify-center h-[52px] rounded-full flex-shrink-0 cursor-pointer"
      aria-label={tab.label}
    >
      <div className="relative w-full h-full flex items-center justify-center min-w-max">
        
        {/* Inactive Icon (Outlined, z-10) */}
        <motion.div style={{ opacity: inverseOpacity }} className="absolute inset-0 z-10 text-on-surface-variant flex items-center justify-center">
          <IconOutline className="w-[24px] h-[24px]" strokeWidth={1.5} />
        </motion.div>

        {/* Active Icon & Text (Filled, z-30) */}
        <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 z-30 text-primary drop-shadow-sm flex items-center justify-center">
          <IconSolid className="w-[24px] h-[24px]" />
          
          {tab.badge > 0 && (
            <span className="absolute top-[8px] right-[8px] bg-primary text-on-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-elevated">
              {tab.badge > 9 ? '9+' : tab.badge}
            </span>
          )}

          <motion.div 
            style={{ 
              width: useTransform(textOpacity, [0, 1], [0, 50]),
              paddingLeft: useTransform(textOpacity, [0, 1], [0, 8]),
              overflow: "hidden"
            }}
            className="flex items-center justify-start ml-1"
          >
            <span className="font-label text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
              {tab.label}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.button>
  );
}
