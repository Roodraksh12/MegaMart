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
    <div className="bg-surface min-h-screen pb-32">
      {/* Full Bleed Image Header */}
      <div className="relative bg-surface-container-low h-[50vh] sm:h-[60vh] md:h-[500px] w-full flex items-center justify-center overflow-hidden rounded-b-3xl sm:rounded-none">
        
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

        {/* Sticky-ish Add to Cart Bottom Bar on Mobile, static on Desktop */}
        <div className="fixed sm:static bottom-0 left-0 right-0 p-4 sm:p-0 bg-surface/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-surface-container sm:border-none z-30 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-0">
          <div className="max-w-4xl mx-auto flex gap-4">
            {quantity === 0 ? (
              <button
                onClick={() => addToCart(product.id, 1)}
                disabled={!product.inStock}
                className={cn(
                  'w-full btn-primary h-14 text-base shadow-ambient flex items-center justify-center gap-2',
                  !product.inStock && 'opacity-50 cursor-not-allowed bg-surface-container-highest text-on-surface-variant'
                )}
              >
                <ShoppingCart size={20} className="mb-0.5" />
                Add to Cart
              </button>
            ) : (
              <div className="w-full flex gap-3 h-14">
                <div className="flex items-center bg-surface-container flex-1 rounded-xl">
                  <button
                    className="flex-1 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors rounded-l-xl"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center text-lg font-bold font-headline">{quantity}</span>
                  <button
                    className="flex-1 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors rounded-r-xl"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={toggleCart}
                  className="flex-1 btn-primary shadow-ambient flex items-center justify-center gap-2"
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
