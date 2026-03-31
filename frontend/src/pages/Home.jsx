import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Package, ChevronRight } from 'lucide-react';
import { CATEGORIES, QUICK_BASKETS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

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

      {/* Hero Banner */}
      <div className="bg-primary px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-white">
            <p className="text-sm font-medium text-green-200 mb-2">⚡ Delivered in 30 minutes</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
              Fresh groceries,<br />at your door.
            </h1>
            <p className="text-green-100 text-sm md:text-base mb-6 max-w-md">
              Vegetables, dairy, bakery and daily essentials — delivered fresh.
            </p>
            <button
              onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-md hover:bg-green-50 transition-colors text-sm"
            >
              Shop Now <ChevronRight size={16} />
            </button>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
            {products.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white/10 rounded-lg p-3 flex flex-col items-center gap-1 w-24">
                <span className="text-3xl">{p.image?.startsWith('http') ? '📦' : p.image}</span>
                <span className="text-white text-[10px] font-medium text-center line-clamp-1">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
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
                  : 'bg-white text-text-dark border-gray-200 hover:border-gray-300'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fresh Picks */}
      {freshPicks.length > 0 && (
        <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-green-600 fill-green-600" />
              <h2 className="font-semibold text-base text-text-dark">Fresh Picks Today</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
            {freshPicks.map(product => (
              <div key={product.id} className="min-w-[160px] sm:min-w-[180px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Baskets */}
      <div className="mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-text-muted" />
          <h2 className="font-semibold text-base text-text-dark">Quick Baskets</h2>
          <span className="text-xs text-text-muted ml-1">· 1-click bundles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_BASKETS.map(basket => (
            <div key={basket.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm text-text-dark">{basket.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{basket.items.length} items</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-base">₹{basket.price}</span>
                  <span className="text-xs text-green-600 font-medium">Save ₹{basket.saving}</span>
                </div>
              </div>
              <button
                onClick={() => { basket.items.forEach(id => addToCart(id, 1)); toggleCart(); }}
                className="flex-shrink-0 border border-primary text-primary text-xs font-semibold px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors"
              >
                Add All
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Product Grid */}
      <section id="shop-section" className="mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-semibold text-base text-text-dark mb-4">
          {activeCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === activeCategory)?.name}
          <span className="text-text-muted font-normal text-sm ml-2">({filteredProducts.length} items)</span>
        </h2>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg h-52 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No products in this category.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
