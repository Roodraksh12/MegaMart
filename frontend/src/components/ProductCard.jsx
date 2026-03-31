import React, { useState } from 'react';
import { Heart, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Image Area */}
      <div className="relative bg-gray-50 p-3 flex items-center justify-center" style={{ aspectRatio: '1' }}>
        {/* Discount badge */}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {product.discount}% OFF
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>

        {/* Product image */}
        {product.image?.startsWith('http') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-5xl select-none">{product.image}</span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-0.5">{product.unit}</p>
        <p className="text-sm font-medium text-text-dark leading-snug line-clamp-2 flex-1">{product.name}</p>

        <div className="mt-3 flex items-center justify-between">
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
                'bg-primary text-white text-xs font-semibold px-4 py-1 rounded hover:bg-primary-dark transition-colors',
                !product.inStock && 'opacity-40 cursor-not-allowed bg-gray-300 hover:bg-gray-300'
              )}
            >
              Add
            </button>
          ) : (
            <div className="flex items-center border border-primary rounded overflow-hidden">
              <button
                className="px-2 py-1 text-primary hover:bg-primary hover:text-white transition-colors"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus size={12} />
              </button>
              <span className="px-2 text-xs font-bold text-primary">{quantity}</span>
              <button
                className="px-2 py-1 text-primary hover:bg-primary hover:text-white transition-colors"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
