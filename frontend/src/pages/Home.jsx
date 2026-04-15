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
    <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col gap-4 shadow-ambient hover:shadow-ambient-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <span className={cn('chip', chipColor)}>{chipText}</span>
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
  const { addToCart, toggleCart, products, fetchProducts, isProductsLoading } = useStore();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const bestSellers = products.filter(p => p.tags?.includes('popular')).slice(0, 5);
  const recentPantry = products.filter(p => p.isFresh).slice(0, 5);

  const { QUICK_BASKETS: baskets } = { QUICK_BASKETS };

  const bundleChips = [
    { color: 'bg-secondary-container text-on-secondary-container', text: 'Morning Fresh' },
    { color: 'bg-tertiary-container text-on-tertiary-container',  text: 'Pantry Refill' },
    { color: 'bg-primary-container text-on-primary-container',    text: 'Health First'  },
  ];

  return (
    <div className="bg-surface pb-20">

      {/* ── Hero / Deals Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary h-[380px] md:h-[420px] flex items-end pb-8 md:pb-0 md:items-center px-6 md:px-14 group">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent z-10" />
          {/* Decorative circles */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-dim opacity-60" />
          <div className="absolute -right-4 bottom-0 w-48 h-48 rounded-full bg-surface/10" />

          <div className="relative z-20 max-w-lg">
            <span className="inline-block chip bg-secondary-container text-on-secondary-container mb-4">
              Limited Time Offer
            </span>
            <h1 className="text-white text-4xl md:text-5xl font-headline font-bold mb-4 leading-[1.1] tracking-tight">
              The Season's<br />Freshest Harvest.
            </h1>
            <p className="text-primary-fixed text-base md:text-lg mb-8 font-body">
              Flat 20% off on your first order of organic dairy & pantry essentials.
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
                  'w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200',
                  isActive
                    ? 'bg-secondary-container scale-105 shadow-ambient'
                    : 'bg-surface-container-high group-hover:scale-110 group-hover:bg-surface-container-highest'
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

      {/* ── Best Sellers (shown only on "All" tab) ── */}
      {activeCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-1">
                Best Sellers
              </h2>
              <p className="text-on-surface-variant font-body text-sm">
                Most loved by our community this week.
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
              : bestSellers.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
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
        <section className="bg-surface-container-low -mx-0 px-0 py-10 mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-1">
                Daily Essentials
              </h2>
              <p className="text-on-surface-variant font-body text-sm">
                Everything your kitchen needs for the day ahead.
              </p>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 md:grid md:grid-cols-3 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
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
        <section className="bg-tertiary-container py-10 mt-8 rounded-b-3xl sm:rounded-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-tertiary-container mb-6">
              Recently in Your Pantry
            </h2>
            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {isProductsLoading
                ? [...Array(5)].map((_, i) => <div key={i} className="w-[160px] md:w-auto flex-shrink-0"><SkeletonCard /></div>)
                : recentPantry.map((product, i) => (
                    <div
                      key={product.id}
                      className="animate-fade-in w-[160px] sm:w-[180px] md:w-auto flex-shrink-0 snap-start"
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
                className="animate-fade-in"
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
