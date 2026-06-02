import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingBasket } from 'lucide-react';
import { CATEGORIES, QUICK_BASKETS } from '../data/mockData';
// QUICK_BASKETS is used directly from the import above
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

/* ─────────────────────────────────────────────
   Category icon map (Material Symbols names → emoji fallback)
─────────────────────────────────────────────── */
const CATEGORY_ICONS = {
  'all':        { emoji: '🛒',  label: 'All Products'  },
  'veg-fruits': { emoji: '🥦',  label: 'Veggies'       },
  'dairy':      { emoji: '🥛',  label: 'Dairy'         },
  'bakery':     { emoji: '🍞',  label: 'Bakery'        },
  'cleaning':   { emoji: '🧹',  label: 'Household'     },
  'beverages':  { emoji: '🥤',  label: 'Beverages'     },
  'snacks':     { emoji: '🍫',  label: 'Snacks'        },
  'staples':    { emoji: '🌾',  label: 'Staples'       },
  'frozen':     { emoji: '🧊',  label: 'Frozen'        },
};

/* ─────────────────────────────────────────────
   Skeleton card – shimmer while products load
─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton rounded-xl" style={{ aspectRatio: '1/1' }} />
      <div className="space-y-1.5 px-0.5">
        <div className="skeleton h-2.5 w-1/3 rounded-full" />
        <div className="skeleton h-3.5 w-4/5 rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Bento bundle card (Daily Essentials section)
─────────────────────────────────────────────── */
function BentoCard({ bundle, chipColor, chipText }) {
  const { addToCart } = useStore();
  return (
    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-lg hover:border-white/80">
      <div className="flex justify-between items-start">
        <span className={cn('chip bg-white/50 backdrop-blur border border-white/40 text-on-surface', chipColor)}>{chipText}</span>
        <span className="font-headline font-bold text-primary">₹{bundle.price}</span>
      </div>
      <h4 className="text-lg font-headline font-bold text-on-surface">{bundle.name}</h4>
      <p className="text-sm text-on-surface-variant font-body flex-1">
        Save ₹{bundle.saving} on this curated bundle.
      </p>
      <button
        onClick={() => bundle.items.forEach(id => addToCart(id, 1))}
        className="w-full btn-primary text-center rounded-lg"
      >
        Quick Add Bundle
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Home Page
═══════════════════════════════════════════ */
export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [mood, setMood] = useState('day');
  const { addToCart, toggleCart, products, fetchProducts, isProductsLoading } = useStore();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) setMood('night');
    else if (hour >= 5 && hour < 11) setMood('morning');
    else setMood('day');
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  let moodProducts = [];
  if (mood === 'night') moodProducts = products.filter(p => p.category === 'snacks' || p.category === 'frozen' || p.category === 'beverages');
  else if (mood === 'morning') moodProducts = products.filter(p => p.category === 'dairy' || p.category === 'bakery');
  
  if (moodProducts.length < 5) {
    moodProducts = [...moodProducts, ...products.filter(p => p.tags?.includes('popular'))];
  }
  moodProducts = Array.from(new Set(moodProducts)).slice(0, 5);

  const recentPantry = products.filter(p => p.isFresh).slice(0, 5);

  const bundleChips = [
    { color: 'bg-secondary-container text-on-secondary-container', text: 'Morning Fresh' },
    { color: 'bg-tertiary-container text-on-tertiary-container',  text: 'Pantry Refill' },
    { color: 'bg-primary-container text-on-primary-container',    text: 'Health First'  },
  ];

  // Dynamic Theme Config
  const moodTheme = {
    night: {
      bg: 'bg-slate-900',
      gradient: 'from-slate-900 via-indigo-900/95 to-transparent',
      title: "Midnight\nCravings?",
      subtitle: "Satisfy your late-night hunger with instant delivery.",
      chip: "Night Owl Express",
      sectionTitle: "Midnight Cravings",
      sectionSub: "Snacks, ice cream, and instant food."
    },
    morning: {
      bg: 'bg-orange-500',
      gradient: 'from-orange-500 via-yellow-500/90 to-transparent',
      title: "Rise and\nShine.",
      subtitle: "Fresh dairy, bakery & morning essentials.",
      chip: "Morning Fresh",
      sectionTitle: "Morning Fresh",
      sectionSub: "Dairy, bread, and breakfast essentials."
    },
    day: {
      bg: 'bg-primary',
      gradient: 'from-primary via-primary/90 to-transparent',
      title: "The Season's\nFreshest Harvest.",
      subtitle: "Flat 20% off on your first order of organic dairy & pantry essentials.",
      chip: "Limited Time Offer",
      sectionTitle: "Best Sellers",
      sectionSub: "Most loved by our community this week."
    }
  };

  const theme = moodTheme[mood];

  return (
    <div className="pb-28 pt-2 transition-colors duration-1000 relative">

      {/* ── Hero / Deals Banner ── */}
      <section className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-0 sm:pt-6 relative z-10">
        <div className={cn("glass-panel relative overflow-hidden sm:rounded-3xl border-x-0 sm:border-x h-[380px] md:h-[420px] flex items-end pb-8 md:pb-0 md:items-center px-6 md:px-14 group transition-colors duration-1000", theme.bg)}>
          {/* Gradient overlay */}
          <div className={cn("absolute inset-0 bg-gradient-to-r z-10 transition-colors duration-1000", theme.gradient)} />
          {/* Decorative circles */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white opacity-10" />
          <div className="absolute -right-4 bottom-0 w-48 h-48 rounded-full bg-black opacity-10" />

          <div className="relative z-20 max-w-lg">
            <span className="inline-block chip bg-white/20 text-white backdrop-blur-md mb-4 border border-white/30">
              {theme.chip}
            </span>
            <h1 className="text-white text-4xl md:text-5xl font-headline font-bold mb-4 leading-[1.1] tracking-tight whitespace-pre-line">
              {theme.title}
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-8 font-body">
              {theme.subtitle}
            </p>
            <button
              onClick={toggleCart}
              className="bg-surface-container-lowest text-primary font-bold px-8 py-3 rounded-lg hover:bg-secondary-fixed transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBasket size={18} />
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* ── Category Quick Links Rail ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-6 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_ICONS[cat.id] || { emoji: '📦', label: cat.name };
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0"
              >
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300',
                  isActive
                    ? 'glass-pill scale-110 shadow-ambient-lg border-white/80'
                    : 'glass hover:scale-110 shadow-sm border-white/20'
                )}>
                  {meta.emoji}
                </div>
                <span className={cn(
                  'text-[10px] font-label font-bold uppercase tracking-widest whitespace-nowrap transition-colors',
                  isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                )}>
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Mood Specific / Best Sellers (shown only on "All" tab) ── */}
      {activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                {mood === 'night' && '🌙 '}
                {mood === 'morning' && '☀️ '}
                {theme.sectionTitle}
              </h2>
              <p className="text-on-surface-variant font-body text-sm">
                {theme.sectionSub}
              </p>
            </div>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {isProductsLoading
              ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
              : moodProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in h-full"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))
            }
          </div>
        </section>
      )}

      {/* ── Daily Essentials Bento (shown only on "All" tab) ── */}
      {activeCategory === 'all' && (
        <section className="relative z-10 sm:mx-8 px-0 py-10 mt-6 glass-panel sm:rounded-3xl border-x-0 sm:border-x mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-1">
                Daily Essentials
              </h2>
              <p className="text-on-surface-variant font-body text-sm px-4 sm:px-0">
                Everything your kitchen needs for the day ahead.
              </p>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 md:grid md:grid-cols-3 snap-x snap-mandatory px-4 sm:px-0">
              {QUICK_BASKETS.map((bundle, i) => (
                <div key={bundle.id} className="w-[280px] md:w-auto flex-shrink-0 snap-center">
                  <BentoCard
                    bundle={bundle}
                    chipColor={bundleChips[i % bundleChips.length].color}
                    chipText={bundleChips[i % bundleChips.length].text}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently in Your Pantry (fresh picks, "All" tab only) ── */}
      {activeCategory === 'all' && recentPantry.length > 0 && (
        <section className="glass-panel sm:mx-8 py-10 mt-8 border-x-0 sm:border-x sm:rounded-3xl mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-6 px-4 sm:px-0">
              Recently in Your Pantry
            </h2>
            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory px-4 sm:px-0">
              {isProductsLoading
                ? [...Array(5)].map((_, i) => <div key={i} className="w-[160px] md:w-auto flex-shrink-0"><SkeletonCard /></div>)
                : recentPantry.map((product, i) => (
                    <div
                      key={product.id}
                      className="animate-fade-in h-full w-[160px] sm:w-[180px] md:w-auto flex-shrink-0 snap-start"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Main Filtered Product Grid ── */}
      <section
        id="shop-section"
        className={cn(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          activeCategory === 'all' ? 'py-4' : 'py-10'
        )}
      >
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-1">
              {activeCategory === 'all' ? 'All Essentials' : CATEGORIES.find(c => c.id === activeCategory)?.name}
            </h2>
            {!isProductsLoading && (
              <p className="text-on-surface-variant font-body text-sm">
                {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-5xl mb-4 block">🌿</span>
            <p className="text-on-surface-variant font-body">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredProducts.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in h-full"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
