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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Product card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

        {/* Image */}
        <div className="relative bg-gray-50 flex items-center justify-center p-8 overflow-hidden group" style={{ minHeight: 260 }}>
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
              {product.discount}% OFF
            </span>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:shadow-md transition-all z-10"
          >
            <Heart
              size={20}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>

          {product.image?.startsWith('http') ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-52 w-full object-contain transition-transform duration-300 group-hover:scale-110 cursor-zoom-in"
            />
          ) : (
            <span className="text-8xl select-none transition-transform duration-300 group-hover:scale-110 cursor-zoom-in">{product.image}</span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{product.category}</p>
          <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">{product.unit}</p>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 mb-5">
            {product.inStock ? (
              <>
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-xs text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <>
                <XCircle size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through mb-0.5">₹{product.mrp}</span>
                <span className="text-sm font-semibold text-green-600 mb-0.5">Save ₹{savings}</span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product.id, 1)}
              disabled={!product.inStock}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors',
                product.inStock
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-primary rounded-lg overflow-hidden">
                <button
                  className="px-4 py-3 text-primary hover:bg-primary hover:text-white transition-colors"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 text-base font-bold text-primary">{quantity}</span>
                <button
                  className="px-4 py-3 text-primary hover:bg-primary hover:text-white transition-colors"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={toggleCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <ShoppingCart size={16} />
                View Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
