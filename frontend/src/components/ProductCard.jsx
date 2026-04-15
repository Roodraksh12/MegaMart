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
    <div className="flex flex-col h-full group relative">
      {/* Image container */}
      <Link
        to={`/product/${product.id}`}
        className="block relative bg-surface-container-low rounded-xl overflow-hidden
                   transition-all duration-300
                   group-hover:bg-surface-container-lowest group-hover:shadow-ambient"
      >
        <div
          className="relative flex items-center justify-center p-6"
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* Sale badge */}
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-error text-on-error text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest z-10">
              Save {product.discount}%
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-2 right-2 p-1.5 z-10 transition-transform hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              className={isWishlisted ? 'fill-primary text-primary' : 'text-outline hover:text-primary'}
            />
          </button>

          {/* Product image */}
          {product.image?.startsWith('http') ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl select-none transition-transform duration-300 group-hover:scale-110 inline-block">
              {product.image}
            </span>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-surface-dim/80 flex items-center justify-center z-20 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block mb-3">
          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-1">
            {product.category || 'Essential'} · {product.unit}
          </p>
          <h3 className="text-sm font-headline font-bold text-on-surface leading-tight line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price + Add */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col gap-0.5">
            {product.mrp > product.price && (
              <span className="text-[10px] text-on-surface-variant line-through">₹{product.mrp}</span>
            )}
            <span className="font-bold text-on-surface text-sm">₹{product.price}</span>
          </div>

          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product.id, 1)}
              disabled={!product.inStock}
              className={cn(
                'bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-dim active:scale-90 transition-all flex items-center justify-center',
                !product.inStock && 'opacity-30 cursor-not-allowed'
              )}
              aria-label="Add to cart"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-1">
              <button
                className="text-on-surface hover:text-primary transition-colors"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={2} />
              </button>
              <span className="text-[12px] font-bold text-on-surface w-4 text-center">{quantity}</span>
              <button
                className="text-on-surface hover:text-primary transition-colors"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
