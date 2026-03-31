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

      {/* ── Hero Banner ── flat green, simple text, no decorative cards ── */}
      <div className="bg-primary px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap size={14} className="text-green-200 fill-green-200" />
            <p className="text-sm font-medium text-green-200">Delivered in 30 minutes</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Fresh groceries,<br />at your door.
          </h1>
          <p className="text-green-100 text-sm md:text-base mb-7 max-w-md">
            Vegetables, dairy, bakery and daily essentials — delivered fresh.
          </p>
          <button
            onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-md hover:bg-green-50 transition-colors text-sm"
          >
            Shop Now <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm border transition-colors flex-shrink-0',
                activeCategory === category.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
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
          <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {QUICK_BASKETS.map(basket => (
              <div key={basket.id} className="flex items-center justify-between px-4 py-3 gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{basket.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{basket.items.length} items</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-sm text-gray-900">₹{basket.price}</span>
                    <p className="text-xs text-green-600 font-medium">Save ₹{basket.saving}</p>
                  </div>
                  <button
                    onClick={() => { basket.items.forEach(id => addToCart(id, 1)); toggleCart(); }}
                    className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded hover:bg-primary-dark transition-colors"
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
