import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, Package, Zap } from 'lucide-react';
import { CATEGORIES, QUICK_BASKETS } from '../data/mockData';
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
      <div className="bg-gradient-to-br from-[#E8F8EE] via-[#F4FCF7] to-white px-4 sm:px-6 lg:px-8 py-12 md:py-16 md:mt-2 lg:mt-4 md:rounded-3xl max-w-[96%] mx-auto overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-1.5 mb-4 w-fit px-3 py-1 bg-white border border-green-100 rounded-full shadow-sm">
            <Zap size={14} className="text-primary fill-primary" />
            <p className="text-xs font-semibold text-primary">Delivered in 30 minutes</p>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-dark leading-tight mb-5 tracking-tight">
            Fresh groceries,<br />
            <span className="text-primary font-bold">at your door.</span>
          </h1>
          <p className="text-text-muted text-sm md:text-base mb-8 max-w-md leading-relaxed">
            Vegetables, dairy, bakery and daily essentials — delivered fresh directly from our store to your home.
          </p>
          <button
            onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-all text-sm shadow-soft hover:shadow-lg active:scale-95"
          >
            Shop Now <ChevronRight size={16} />
          </button>
        </div>
        {/* Soft decorative blur circle */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[80px] z-0 pointer-events-none" />
      </div>

      {/* ── Category Pills ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 cursor-pointer',
                activeCategory === category.id
                  ? 'bg-text-dark text-white border-transparent shadow-md'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 hover:text-text-dark'
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

      {/* ── Quick Baskets ── simple horizontal rows ── */}
      {activeCategory === 'all' && (
        <div className="mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-gray-500" />
            <h2 className="font-semibold text-base text-gray-900">Quick Baskets</h2>
            <span className="text-xs text-gray-400 ml-1">· 1-click bundles</span>
          </div>
            <div className="flex flex-col gap-3">
            {QUICK_BASKETS.map(basket => (
              <div key={basket.id} className="flex items-center justify-between px-4 py-4 bg-white border border-gray-100/50 rounded-2xl shadow-sm hover:shadow-soft hover:border-gray-200 transition-all group">
                <div>
                  <h3 className="font-semibold text-sm text-text-dark">{basket.name}</h3>
                  <p className="text-xs text-text-muted mt-1 bg-gray-50 px-2 py-0.5 rounded inline-block">{basket.items.length} items</p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="text-right flex flex-col items-end">
                    <span className="font-bold text-sm text-text-dark">₹{basket.price}</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Save ₹{basket.saving}</span>
                  </div>
                  <button
                    onClick={() => { basket.items.forEach(id => addToCart(id, 1)); toggleCart(); }}
                    className="bg-gray-900 border border-transparent text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-all active:scale-95 group-hover:shadow-md"
                  >
                    Add All
                  </button>
                </div>
              </div>
            ))}
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
