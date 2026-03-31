import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Package } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="bg-primary/5 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs tracking-wider uppercase">
                Free Delivery above ₹499
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-text-dark leading-tight">
                Fresh Groceries, <br/>
                <span className="text-primary text-5xl md:text-7xl">Delivered Local.</span>
              </h1>
              <p className="text-text-muted text-lg max-w-md">
                Skip the lines. Get farm-fresh vegetables, dairy, and daily essentials delivered right to your door in minutes.
              </p>
              <button 
                onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex items-center gap-2 text-lg px-6 py-3 shadow-xl shadow-primary/20 rounded-xl"
              >
                Shop Now <ArrowRight size={20} />
              </button>
            </div>
            <div className="flex-1 w-full relative h-[300px] md:h-[400px]">
              {/* Abstract decorative hero composition */}
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl opacity-50 transform translate-x-10 translate-y-10"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-premium p-6 text-6xl flex items-center justify-center bg-white rotate-[-6deg] shadow-2xl">🥦</div>
                  <div className="card-premium p-6 text-6xl flex items-center justify-center bg-white rotate-[6deg] shadow-2xl translate-y-8">🍞</div>
                  <div className="card-premium p-6 text-6xl flex items-center justify-center bg-white rotate-[3deg] shadow-2xl -translate-y-4">🥛</div>
                  <div className="card-premium p-6 text-6xl flex items-center justify-center bg-white rotate-[-3deg] shadow-2xl translate-y-4">🍎</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Picks Horizontal Slider */}
      {freshPicks.length > 0 && (
        <section className="py-8 bg-green-50 border-y border-green-100 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="text-green-600 fill-green-600" size={24} />
              <h2 className="font-display font-bold text-2xl text-text-dark">Today's Fresh Picks</h2>
              <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">Arrived at 6 AM</span>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {freshPicks.map(product => (
                <div key={product.id} className="min-w-[200px] sm:min-w-[220px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Baskets */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Package className="text-accent" size={24} />
          <h2 className="font-display font-bold text-2xl text-text-dark">Quick Baskets</h2>
          <span className="text-sm text-text-muted ml-2">1-click bundles for your daily needs</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUICK_BASKETS.map(basket => (
            <div key={basket.id} className="bg-surface border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full -z-10 group-hover:bg-accent/20 transition-colors"></div>
              <h3 className="font-bold text-lg text-text-dark mb-1">{basket.name}</h3>
              <p className="text-xs text-text-muted mb-4">Includes {basket.items.length} premium items</p>
              
              <div className="flex -space-x-3 mb-4">
                {basket.items.map((itemId, i) => {
                  const product = products.find(p => p.id === itemId);
                  return (
                    <div key={itemId} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm z-[calc(10-i)]" style={{ zIndex: 10 - i }}>
                      {product?.image}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-end justify-between mt-6">
                <div>
                  <div className="text-sm text-green-600 font-medium mb-1">Save ₹{basket.saving}</div>
                  <div className="font-bold text-2xl text-text-dark">₹{basket.price}</div>
                </div>
                <button 
                  onClick={() => {
                    basket.items.forEach(id => addToCart(id, 1));
                    toggleCart();
                  }}
                  className="btn-secondary whitespace-nowrap"
                >
                  Add Bundle
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Shop Section */}
      <section id="shop-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display font-bold text-3xl text-text-dark mb-8">Shop by Category</h2>
        
        {/* Category Chips */}
        <div className="flex overflow-x-auto pb-4 gap-3 mb-8 hide-scrollbar">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border",
                activeCategory === category.id 
                  ? "bg-primary text-white border-primary shadow-md" 
                  : "bg-surface text-text-dark border-gray-200 hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium text-sm">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-xl text-text-muted">No products found in this category.</h3>
          </div>
        )}
      </section>
    </div>
  );
}
