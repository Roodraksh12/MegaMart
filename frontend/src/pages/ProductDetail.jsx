import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Plus, Minus, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, cart, addToCart, updateQuantity, wishlist, toggleWishlist, toggleCart, fetchProducts, isProductsLoading } = useStore();

  // On direct load / refresh the store may be empty — fetch if needed
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const product = products.find(p => String(p.id) === String(id));

  // Still fetching — show a skeleton so the user never sees "not found"
  if (isProductsLoading || (!product && products.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 animate-pulse">
        <div className="h-4 w-16 bg-gray-200 rounded mb-6" />
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-100" style={{ minHeight: 260 }} />
          <div className="p-5 space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-1/4 bg-gray-200 rounded" />
            <div className="h-8 w-28 bg-gray-200 rounded mt-4" />
            <div className="h-12 w-full bg-gray-200 rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Products loaded but this ID genuinely doesn't exist
  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <XCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Product not found</h2>
        <p className="text-sm text-gray-400 mb-6">This product may no longer be available.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);
  const savings = product.mrp > product.price ? product.mrp - product.price : 0;

  return (
    <div className="min-h-screen pb-32 pt-2">
      {/* Full Bleed Image Header */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
        
        {/* Top Actions overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-20">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-surface/80 backdrop-blur-2xl rounded-full text-on-surface shadow-soft hover:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="p-2.5 bg-surface/80 backdrop-blur-2xl rounded-full shadow-soft hover:scale-95 transition-transform"
          >
            <Heart
              size={20}
              className={isWishlisted ? 'fill-error text-error' : 'text-on-surface'}
            />
          </button>
        </div>

        {/* Badges */}
        {product.discount > 0 && (
          <span className="absolute bottom-6 left-6 bg-tertiary-container text-on-tertiary-container text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-soft">
            {product.discount}% OFF
          </span>
        )}

        {/* Imagery */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          {product.image?.startsWith('http') ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <span className="text-[120px] sm:text-[180px] drop-shadow-2xl transition-transform duration-500 hover:scale-105 select-none text-center">
              {product.image}
            </span>
          )}
        </div>
      </div>

      {/* Editorial Content */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        
        {/* Meta & Title */}
        <div className="mb-8">
          <span className="chip bg-surface-container-high text-on-surface mb-4">{product.category}</span>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-on-surface leading-[1.1] tracking-tight mb-2">
            {product.name}
          </h1>
          <p className="text-lg font-body text-on-surface-variant">{product.unit}</p>
        </div>

        {/* Pricing Segment */}
        <div className="flex items-end justify-between border-b border-surface-container pb-6 mb-6">
          <div className="flex flex-col">
            <span className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">Our Price</span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold font-headline text-on-surface">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-lg text-outline line-through font-body">₹{product.mrp}</span>
              )}
            </div>
            {product.mrp > product.price && (
              <span className="text-sm font-bold text-primary mt-1">You save ₹{savings}</span>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            {product.inStock ? (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container">
                  <CheckCircle size={16} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-on-surface">In Stock</span>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-error-container text-on-error-container">
                  <XCircle size={16} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-error">Out of Stock</span>
              </>
            )}
          </div>
        </div>

        {/* Placeholder Product Description & Features */}
        <div className="space-y-6 mb-8 mt-6">
          <div>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Description</h3>
            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
              Experience the finest quality {product.name.toLowerCase()}, sourced directly from organic farms to ensure maximum freshness and nutritional value. Carefully handpicked and packed under strict hygiene standards, this is a must-have essential for your daily needs.
            </p>
          </div>
          
          <div className="bg-surface-container-low rounded-3xl p-5 flex justify-between items-start gap-2">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                <CheckCircle size={22} />
              </div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Top Quality</span>
            </div>
            <div className="flex flex-col items-center text-center flex-1 border-x border-surface-container-high px-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">100% Secure</span>
            </div>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21h14"/><path d="M6 18H4c-1 0-2-1-2-2v-5c0-1.1.9-2 2-2h1"/><path d="M17 9h1c1 0 2 .9 2 2v5c0 1-1 2-2 2h-2"/><path d="M12 22v-9"/><path d="M12 13V7"/><path d="M9 7h6"/><path d="M12 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Fresh Pick</span>
            </div>
          </div>
        </div>

        {/* Floating Add to Cart Bottom Bar on Mobile, static on Desktop */}
        <div className="fixed sm:static bottom-6 sm:bottom-0 left-4 right-4 sm:left-0 sm:right-0 z-30 pointer-events-none">
          <div className="max-w-4xl mx-auto flex gap-4 pointer-events-auto">
            {quantity === 0 ? (
              <button
                onClick={() => addToCart(product.id, 1)}
                disabled={!product.inStock}
                className={cn(
                  'w-full btn-primary !rounded-full h-14 text-base shadow-ambient flex items-center justify-center gap-2',
                  !product.inStock && 'opacity-50 cursor-not-allowed bg-surface-container-highest text-on-surface-variant'
                )}
              >
                <ShoppingCart size={20} className="mb-0.5" />
                Add to Cart
              </button>
            ) : (
              <div className="w-full flex gap-3 h-14">
                <div className="flex items-center bg-surface-container flex-1 rounded-full">
                  <button
                    className="flex-1 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors rounded-l-full"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center text-lg font-bold font-headline">{quantity}</span>
                  <button
                    className="flex-1 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors rounded-r-full"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={toggleCart}
                  className="flex-1 btn-primary !rounded-full shadow-ambient flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} className="mb-0.5" />
                  View Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
