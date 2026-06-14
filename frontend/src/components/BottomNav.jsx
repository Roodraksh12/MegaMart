import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ClipboardList, ShoppingBasket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity } from 'framer-motion';

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
  const [tabRects, setTabRects] = useState([]);
  const containerRef = useRef(null);

  // Measure tab dimensions for precise capsule snapping
  useEffect(() => {
    const updateRects = () => {
      if (containerRef.current) {
        const rects = tabs.map((tab) => {
          const el = document.getElementById(`nav-tab-${tab.id}`);
          if (!el) return null;
          return {
            id: tab.id,
            left: el.offsetLeft,
            width: el.offsetWidth,
            center: el.offsetLeft + el.offsetWidth / 2
          };
        }).filter(Boolean);
        setTabRects(rects);
      }
    };
    // Small delay to ensure DOM is fully painted
    setTimeout(updateRects, 50);
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
  }, [cartCount]);

  // Sync active tab with current route
  useEffect(() => {
    const currentTab = tabs.find(t => t.to === location.pathname);
    if (currentTab) setActiveTab(currentTab.id);
  }, [location.pathname]);

  // ── Scroll Behavior (Compression & Transparency) ──
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Dynamic dock transforms based on scroll speed and direction
  const dockScale = useTransform(smoothVelocity, [-1000, 0, 1000], [1, 1, 0.95]);
  const dockY = useTransform(smoothVelocity, [-1000, 0, 1000], [0, 0, 12]);
  const dockOpacity = useTransform(smoothVelocity, [-1000, 0, 1000], [1, 1, 0.75]);

  // ── Liquid Capsule Physics & State ──
  const capsuleX = useMotionValue(0);
  const capsuleWidth = useMotionValue(0);
  const isDragging = useMotionValue(0);
  
  // Premium Native Spring configurations
  const springConfig = { stiffness: 400, damping: 30, mass: 1 };
  const animatedX = useSpring(capsuleX, springConfig);
  const animatedWidth = useSpring(capsuleWidth, springConfig);

  // Velocity for liquid stretch effect (Capsule deforms organically)
  const xVelocity = useVelocity(animatedX);
  const stretchScale = useTransform(xVelocity, [-1500, 0, 1500], [1.3, 1, 1.3]);
  const stretchOrigin = useTransform(xVelocity, [-1500, 0, 1500], ["100%", "50%", "0%"]);

  // Sync capsule with active tab when NOT dragging
  useEffect(() => {
    if (tabRects.length > 0 && isDragging.get() === 0) {
      const activeRect = tabRects.find(r => r.id === activeTab) || tabRects[0];
      capsuleX.set(activeRect.left);
      capsuleWidth.set(activeRect.width);
    }
  }, [activeTab, tabRects, isDragging, capsuleX, capsuleWidth]);

  // ── Gesture Handling ──
  const handlePan = (e, info) => {
    isDragging.set(1);
    const newX = capsuleX.get() + info.delta.x;
    
    // Clamp to dock boundaries with slight rubber-banding
    const minX = tabRects[0]?.left || 0;
    const maxX = tabRects[tabRects.length - 1]?.left || 0;
    capsuleX.set(Math.max(minX - 15, Math.min(newX, maxX + 15)));
  };

  const handlePanEnd = (e, info) => {
    isDragging.set(0);
    // Add momentum to the final release position
    const currentX = capsuleX.get() + info.velocity.x * 0.15; 
    
    // Find the closest tab to snap to
    let nearestTab = tabRects[0];
    let minDistance = Infinity;
    
    tabRects.forEach(rect => {
      const distance = Math.abs(rect.left - currentX);
      if (distance < minDistance) {
        minDistance = distance;
        nearestTab = rect;
      }
    });

    // Commit snap and navigate
    setActiveTab(nearestTab.id);
    const tabObj = tabs.find(t => t.id === nearestTab.id);
    if (tabObj) {
      if (tabObj.action) tabObj.action();
      else navigate(tabObj.to);
    }
  };

  if (isAdmin || isProductPage) return null;

  return (
    <motion.nav 
      style={{ scale: dockScale, y: dockY, opacity: dockOpacity }}
      className="md:hidden fixed bottom-6 left-4 right-4 z-40 premium-glass-dock h-[74px] flex items-center px-1.5 touch-none"
    >
      <motion.div 
        ref={containerRef}
        className="relative flex items-center justify-between w-full h-full"
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        
        {/* The Liquid Capsule Background */}
        <motion.div
          style={{
            x: animatedX,
            width: animatedWidth,
            scaleX: stretchScale,
            transformOrigin: stretchOrigin,
          }}
          className="absolute h-[62px] premium-glass-capsule z-0 pointer-events-none"
        />

        {/* Navigation Items */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={(e) => {
                // Prevent click if we are actually dragging
                if (Math.abs(xVelocity.get()) > 50) return; 
                setActiveTab(tab.id);
                if (tab.action) tab.action();
                else navigate(tab.to);
              }}
              className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full"
            >
              <motion.div 
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -2 : 0 }} 
                transition={springConfig}
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
              </motion.div>
              
              <motion.span 
                animate={{ opacity: isActive ? 1 : 0.5, y: isActive ? 0 : 2 }}
                className={cn(
                  "font-label text-[10px] font-bold uppercase tracking-widest transition-colors duration-300", 
                  isActive ? "text-primary" : "text-on-surface-variant"
                )}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </motion.div>
    </motion.nav>
  );
}
