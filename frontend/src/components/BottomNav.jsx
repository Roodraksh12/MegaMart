import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// Robust SVG Filter for Chromatic Aberration and Liquid Distortion
// Works across all browsers because we apply it directly, avoiding the buggy backdrop-filter spec.
const OpticalRefractionFilter = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
    <defs>
      <filter id="liquid-chromatic" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        {/* Strong liquid ripples */}
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="1.5" result="smoothNoise" />
        <feDisplacementMap in="SourceGraphic" in2="smoothNoise" scale="25" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        
        {/* RGB Split */}
        <feColorMatrix in="displaced" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feColorMatrix in="displaced" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feColorMatrix in="displaced" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />

        {/* Offset for Chromatic Aberration fringes */}
        <feOffset in="red" dx="5" dy="0" result="red-offset" />
        <feOffset in="blue" dx="-5" dy="0" result="blue-offset" />

        {/* Recombine channels */}
        <feBlend mode="screen" in="red-offset" in2="green" result="rg" />
        <feBlend mode="screen" in="rg" in2="blue-offset" result="chromatic" />

        {/* Invert so the white graphic becomes black, creating Cyan/Red fringes */}
        <feComponentTransfer in="chromatic" result="inverted">
          <feFuncR type="linear" slope="-1" intercept="1" />
          <feFuncG type="linear" slope="-1" intercept="1" />
          <feFuncB type="linear" slope="-1" intercept="1" />
        </feComponentTransfer>
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

  const progress = useMotionValue(0);

  useEffect(() => {
    const idx = tabs.findIndex(t => t.to === location.pathname);
    if (idx !== -1 && idx !== activeIndex) {
      setActiveTab(tabs[idx].id);
      animate(progress, idx, { type: "spring", stiffness: 400, damping: 32 });
    }
  }, [location.pathname]);

  useEffect(() => { progress.set(activeIndex); }, []);

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

  const lensLeft = useTransform(progress, [0, 0.5, 1, 1.5, 2, 2.5, 3], [6, 6, 64, 64, 122, 122, 180]);
  const lensWidth = useTransform(progress, [0, 0.5,  1, 1.5,  2, 2.5,  3], [110, 168, 110, 168, 110, 168, 110]);

  if (isAdmin || isProductPage) return null;

  return (
    <>
      <OpticalRefractionFilter />
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 flex items-center justify-center pointer-events-none">
        <motion.div 
          onPanStart={handlePanStart}
          onPan={handlePan} 
          onPanEnd={handlePanEnd}
          className="relative flex items-center gap-[6px] pointer-events-auto bg-white/40 backdrop-blur-md border border-white/40 p-[6px] rounded-full shadow-lg touch-none"
          style={{ width: 296, height: 64 }}
        >
          {/* ── Layer 1: Outer Tab Items (Inactive: z-10, Active: z-30) ── */}
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

          {/* ── Layer 2: Parallax Clipping Mask (Lens: z-20) ── */}
          {/* This avoids buggy iOS backdrop-filter entirely by physically filtering duplicate icons inside a mask */}
          <motion.div
            className="absolute top-[6px] bottom-[6px] z-20 rounded-full overflow-hidden pointer-events-none"
            style={{ 
              left: lensLeft, 
              width: lensWidth,
              background: 'rgba(255, 255, 255, 0.5)',
              boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.7)'
            }}
          >
            {/* Inner parallax container moves opposite to the lens to perfectly align with the outer tabs */}
            <motion.div 
              className="absolute top-0 bottom-0 flex items-center gap-[6px]"
              style={{ left: useTransform(lensLeft, v => 6 - v), width: 284 }}
            >
              {/* Applies the extreme liquid chromatic aberration filter */}
              <div className="flex items-center gap-[6px] w-full h-full" style={{ filter: 'url(#liquid-chromatic)' }}>
                {tabs.map((tab, i) => (
                  <MaskedTabItem key={`mask-${tab.id}`} tab={tab} index={i} progress={progress} />
                ))}
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </nav>
    </>
  );
}

// ── Standard Tab Component ──
function TabItem({ tab, index, progress, onClick }) {
  const Icon = tab.icon;
  const widthRange = [0, 1, 2, 3].map(i => i === index ? 110 : 52);
  const tabWidth = useTransform(progress, [0, 1, 2, 3], widthRange);
  const opacityRange = [0, 1, 2, 3].map(i => i === index ? 1 : 0);
  const textOpacity = useTransform(progress, [0, 1, 2, 3], opacityRange);
  const inverseOpacity = useTransform(textOpacity, v => 1 - v);

  return (
    <motion.button
      onClick={onClick}
      style={{ width: tabWidth }}
      // Crucial: NO z-index here. Allows children to interleave with the Lens (z-20)
      className="relative flex items-center justify-center h-[52px] rounded-full flex-shrink-0 cursor-pointer"
      aria-label={tab.label}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Inactive Icon -> Renders BEHIND the Lens (z-10) */}
        <motion.div style={{ opacity: inverseOpacity }} className="absolute inset-0 z-10 text-on-surface-variant flex items-center justify-center">
          <Icon size={22} strokeWidth={1.8} />
        </motion.div>

        {/* Active Icon & Text -> Renders IN FRONT of the Lens (z-30) */}
        <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 z-30 text-primary drop-shadow-sm flex items-center justify-center">
          <Icon size={22} strokeWidth={2.5} />
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
            className="flex items-center justify-start"
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

// ── Masked Duplicate Tab Component for Chromatic Filter ──
function MaskedTabItem({ tab, index, progress }) {
  const Icon = tab.icon;
  const widthRange = [0, 1, 2, 3].map(i => i === index ? 110 : 52);
  const tabWidth = useTransform(progress, [0, 1, 2, 3], widthRange);

  return (
    <motion.div
      style={{ width: tabWidth }}
      className="flex items-center justify-center h-[52px] rounded-full flex-shrink-0"
    >
       {/* Render pure white so the SVG filter can extract RGB and invert it to black with chromatic fringes */}
       <Icon size={22} strokeWidth={2.5} className="text-white" />
    </motion.div>
  );
}
