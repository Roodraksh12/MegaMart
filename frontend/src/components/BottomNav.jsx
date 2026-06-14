import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const OpticalRefractionFilter = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
    <defs>
      <filter id="liquid-chromatic" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        {/* Strong fractal noise for liquid glass ripples */}
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" result="noise" />
        
        {/* Displacement map to warp the background */}
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        
        {/* Extract channels for Chromatic Aberration */}
        <feColorMatrix in="displaced" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feColorMatrix in="displaced" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feColorMatrix in="displaced" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />

        {/* Offset channels heavily to create cyan/red fringing */}
        <feOffset in="red" dx="5" dy="0" result="red-offset" />
        <feOffset in="blue" dx="-5" dy="0" result="blue-offset" />

        {/* Screen blend them back together */}
        <feBlend mode="screen" in="red-offset" in2="green" result="rg" />
        <feBlend mode="screen" in="rg" in2="blue-offset" result="chromatic" />
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
  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  // Core continuous mathematical progress for 1:1 real-time drag tracking
  const progress = useMotionValue(0);

  // Sync route to index using a spring animation
  useEffect(() => {
    const idx = tabs.findIndex(t => t.to === location.pathname);
    if (idx !== -1 && idx !== activeIndex) {
      setActiveTab(tabs[idx].id);
      animate(progress, idx, { type: "spring", stiffness: 400, damping: 32 });
    }
  }, [location.pathname]);

  // Initial mount sync
  useEffect(() => {
    progress.set(activeIndex);
  }, []);

  // ── Drag Gesture Physics ──
  // Base step is 58px. We map physical delta X to the progress index.
  const DRAG_STEP_PX = 58;
  const startProgress = useMotionValue(0);

  const handlePanStart = () => {
    startProgress.set(progress.get());
  };

  const handlePan = (e, info) => {
    // 1:1 physical tracking mapping deltaX directly to layout morphing
    const rawNewProgress = startProgress.get() + (info.offset.x / DRAG_STEP_PX);
    // Hard clamp to physical bounds
    progress.set(Math.max(0, Math.min(3, rawNewProgress)));
  };

  const handlePanEnd = (e, info) => {
    // Add momentum to calculate where the flick will land
    const momentumProgress = progress.get() + (info.velocity.x / 1000); 
    const closestIndex = Math.max(0, Math.min(3, Math.round(momentumProgress)));
    
    // Commit the state and snap the physics engine to the closest integer
    setActiveTab(tabs[closestIndex].id);
    animate(progress, closestIndex, { type: "spring", stiffness: 450, damping: 32 });

    // Navigate or trigger action
    const tabObj = tabs[closestIndex];
    if (tabObj.action) tabObj.action();
    else navigate(tabObj.to);
  };

  // ── Mathematical Coordinates for the Optical Lens ──
  // Defines the physical width and exact stretch coordinates of the liquid glass
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
    <>
      <OpticalRefractionFilter />
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 optical-nav-dock h-[64px] flex items-center justify-center pointer-events-none">
        
        {/* Transparent Track */}
        <motion.div 
          onPanStart={handlePanStart}
          onPan={handlePan} 
          onPanEnd={handlePanEnd}
          className="relative flex items-center gap-[6px] pointer-events-auto bg-white/30 backdrop-blur-sm border border-white/40 p-[6px] rounded-full shadow-lg touch-none"
          style={{ width: 296, height: 64 }}
        >
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

          {/* ── Floating Optical Glass Lens Overlay ── */}
          <motion.div
            className="absolute top-[6px] bottom-[6px] optical-lens z-20 rounded-full pointer-events-none"
            style={{ left: lensLeft, width: lensWidth }}
          />
        </motion.div>
      </nav>
    </>
  );
}

// ── Mathematically Blended Tab Component ──
function TabItem({ tab, index, progress, onClick }) {
  const Icon = tab.icon;

  // Real-time Width Morphing
  const widthRange = [0, 1, 2, 3].map(i => i === index ? 110 : 52);
  const tabWidth = useTransform(progress, [0, 1, 2, 3], widthRange);

  // Real-time Opacity Crossfading for perfectly smooth color transitions
  const opacityRange = [0, 1, 2, 3].map(i => i === index ? 1 : 0);
  const textOpacity = useTransform(progress, [0, 1, 2, 3], opacityRange);
  const inverseOpacity = useTransform(textOpacity, v => 1 - v);

  // Real-time Scaling
  const scaleRange = [0, 1, 2, 3].map(i => i === index ? 1.05 : 1);
  const tabScale = useTransform(progress, [0, 1, 2, 3], scaleRange);

  return (
    <motion.button
      onClick={onClick}
      style={{ width: tabWidth }}
      className="relative z-10 flex items-center justify-center h-[52px] rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
      aria-label={tab.label}
    >
      <motion.div style={{ scale: tabScale }} className="relative z-10 flex items-center justify-center min-w-max">
        
        {/* Crossfading Dual-Icon System */}
        <div className="relative w-[22px] h-[22px] flex-shrink-0">
          <motion.div style={{ opacity: inverseOpacity }} className="absolute inset-0 text-on-surface-variant flex items-center justify-center">
            <Icon size={22} strokeWidth={1.8} />
          </motion.div>
          <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 text-primary drop-shadow-sm flex items-center justify-center">
            <Icon size={22} strokeWidth={2.5} />
          </motion.div>
          
          {/* Badge (fades out during active expansion to make room for label) */}
          {tab.badge > 0 && (
            <motion.span 
              style={{ opacity: inverseOpacity }}
              className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-elevated"
            >
              {tab.badge > 9 ? '9+' : tab.badge}
            </motion.span>
          )}
        </div>

        {/* Morphing Text Label */}
        <motion.div 
          style={{ 
            opacity: textOpacity,
            width: useTransform(textOpacity, [0, 1], [0, 50]),
            paddingLeft: useTransform(textOpacity, [0, 1], [0, 8]),
            overflow: "hidden"
          }}
          className="flex items-center justify-start"
        >
          <span className="font-label text-[11px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">
            {tab.label}
          </span>
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
