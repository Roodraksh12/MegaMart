import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="card flex flex-col h-full">

      {/* Clickable area: image + name → goes to product detail page */}
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative bg-gray-50 p-3 flex items-center justify-center" style={{ aspectRatio: '1' }}>
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md shadow-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {product.discount}% OFF
            </span>
          )}

          {/* Wishlist — e.preventDefault stops the Link from navigating */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>

          {product.image?.startsWith('http') ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-5xl select-none">{product.image}</span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xs font-bold tracking-widest uppercase text-black bg-white/80 border border-white px-3 py-1.5 rounded-full shadow-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs text-gray-400 mb-0.5">{product.unit}</p>
          <p className="text-sm font-medium text-text-dark leading-snug line-clamp-2">{product.name}</p>
        </div>
      </Link>

      {/* Price + Add to Cart (not part of the link) */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between mt-auto">
        <div>
          <span className="font-bold text-sm">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through ml-1">₹{product.mrp}</span>
          )}
        </div>

        {quantity === 0 ? (
          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={!product.inStock}
            className={cn(
              'btn-primary !px-5 !py-1.5 !text-xs',
              !product.inStock && 'opacity-40 cursor-not-allowed bg-gray-300 hover:bg-gray-300 hover:shadow-none !border-transparent'
            )}
          >
            Add
          </button>
        ) : (
          <div className="flex items-center bg-black/5 border border-black/10 rounded-full overflow-hidden shadow-inner backdrop-blur-md">
            <button
              className="px-3 py-1.5 text-text-dark hover:bg-black hover:text-white transition-all font-bold"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <span className="px-1 text-xs font-bold text-text-dark w-6 text-center">{quantity}</span>
            <button
              className="px-3 py-1.5 text-text-dark hover:bg-black hover:text-white transition-all font-bold"
              onClick={() => updateQuantity(product.id, quantity + 1)}
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
