import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, Zap } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

/* ─────────────────────────────────────────────
   Skeleton card – shimmer while products load
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
      {/* image area */}
      <div className="skeleton" style={{ paddingBottom: '100%', position: 'relative' }} />
      {/* content area */}
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex justify-between items-center mt-3">
          <div className="skeleton h-5 w-14 rounded" />
          <div className="skeleton h-7 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart, toggleCart, products, fetchProducts, isProductsLoading } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const freshPicks = products.filter(p => p.isFresh);

  return (
    <div className="pb-16">

      {/* ── Editorial Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-32 border-b border-black/10">
        <div className="flex items-center gap-2 mb-8">
          <Zap size={12} className="text-black fill-black" />
          <p className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">30 Minute Delivery</p>
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black leading-[0.9] tracking-tighter mb-8 uppercase">
          Fresh.<br />
          <span className="text-gray-300">Fast.</span>
        </h1>
        <div className="max-w-xl flex flex-col sm:flex-row sm:items-center gap-6">
          <p className="text-black text-sm md:text-lg leading-relaxed font-medium">
            Essential groceries, artisanal bakery, and fresh dairy. Curated for you and delivered instantly.
          </p>
          <button
            onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 bg-black text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors w-fit"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* ── Stark Categories ── */}
      <div className="border-b border-black/10 sticky top-[72px] z-30 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'py-5 text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-colors border-b-2',
                  activeCategory === category.id
                    ? 'text-black border-black border-b-2'
                    : 'text-gray-400 border-transparent hover:text-black'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fresh Picks ── */}
      {activeCategory === 'all' && (isProductsLoading || freshPicks.length > 0) && (
        <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6 border-b border-black/10 pb-4">
            <Star size={12} className="text-black fill-black" />
            <h2 className="font-bold text-[11px] uppercase tracking-[0.2em] text-black">Fresh Picks Today</h2>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
            {isProductsLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="min-w-[160px] sm:min-w-[180px]">
                    <SkeletonCard />
                  </div>
                ))
              : freshPicks.map((product, i) => (
                  <div
                    key={product.id}
                    className="min-w-[160px] sm:min-w-[180px] animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))
            }
          </div>
        </div>
      )}


      {/* ── Main Product Grid ── */}
      <section id="shop-section" className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end border-b border-black/10 pb-4 mb-8">
          <h2 className="font-bold text-[11px] uppercase tracking-[0.2em] text-black">
            {activeCategory === 'all' ? 'All Essentials' : CATEGORIES.find(c => c.id === activeCategory)?.name}
          </h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isProductsLoading ? '' : `${filteredProducts.length} Items`}
          </span>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No products in this category.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
