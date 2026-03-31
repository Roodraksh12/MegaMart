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

      {/* ── Hero Banner ── */}
      <div className="bg-white/30 backdrop-blur-2xl border border-white/60 shadow-glass px-4 sm:px-6 lg:px-8 py-12 md:py-16 md:mt-4 lg:mt-6 md:rounded-[2rem] max-w-[96%] mx-auto overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-1.5 mb-5 w-fit px-3 py-1.5 bg-black/5 backdrop-blur-md border border-black/10 rounded-full shadow-inner">
            <Zap size={14} className="text-black fill-black" />
            <p className="text-xs font-bold text-black uppercase tracking-wider">Delivered in 30 minutes</p>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-black leading-tight mb-5 tracking-tighter">
            Fresh groceries.<br />
            <span className="text-text-muted font-light">At your door.</span>
          </h1>
          <p className="text-text-muted text-sm md:text-lg mb-8 max-w-lg leading-relaxed font-medium">
            Vegetables, dairy, bakery and daily essentials — delivered fresh directly from our store to your home.
          </p>
          <button
            onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary inline-flex items-center gap-2"
          >
            Shop Now <ChevronRight size={16} />
          </button>
        </div>
        {/* Soft decorative blur circle */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/40 rounded-full blur-[80px] z-0 pointer-events-none" />
      </div>

      {/* ── Category Pills ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex-shrink-0 cursor-pointer backdrop-blur-md',
                activeCategory === category.id
                  ? 'bg-black text-white border border-black shadow-lg shadow-black/20'
                  : 'bg-white/40 text-text-muted border border-white/60 hover:bg-white/60 hover:text-black hover:shadow-glass'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fresh Picks ── */}
      {activeCategory === 'all' && (isProductsLoading || freshPicks.length > 0) && (
        <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-green-600 fill-green-600" />
            <h2 className="font-semibold text-base text-gray-900">Fresh Picks Today</h2>
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
      <section id="shop-section" className="mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-semibold text-base text-gray-900 mb-4">
          {activeCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === activeCategory)?.name}
          <span className="text-gray-400 font-normal text-sm ml-2">
            {isProductsLoading ? '' : `(${filteredProducts.length} items)`}
          </span>
        </h2>

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
