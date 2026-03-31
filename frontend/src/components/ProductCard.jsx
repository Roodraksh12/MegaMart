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
      <Link to={`/product/${product.id}`} className="block relative bg-[#FAFAFA] overflow-hidden group-hover:bg-[#F0F0F0] transition-colors">
        <div className="relative p-6 flex items-center justify-center mix-blend-multiply" style={{ aspectRatio: '4/5' }}>
          {product.discount > 0 && (
            <span className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest z-10">
              Sale
            </span>
          )}

          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-2 right-2 p-1.5 transition-colors z-10"
          >
            <Heart size={16} className={isWishlisted ? 'fill-black text-black' : 'text-gray-300 hover:text-black'} strokeWidth={1.5} />
          </button>

          {product.image?.startsWith('http') ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <span className="text-5xl select-none">{product.image}</span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className="pt-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block mb-3">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1.5">{product.category || 'Essential'} • {product.unit}</p>
          <h3 className="text-sm font-semibold text-black leading-tight group-hover:underline underline-offset-4 decoration-1">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between border-t border-black/10 pt-3">
          <div className="flex flex-col">
            {product.mrp > product.price && (
              <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
            )}
            <span className="font-bold text-black text-sm">₹{product.price}</span>
          </div>
          
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product.id, 1)}
              disabled={!product.inStock}
              className={cn(
                'text-[10px] font-bold text-black uppercase tracking-widest hover:text-gray-500 transition-colors',
                !product.inStock && 'opacity-30 cursor-not-allowed hover:text-black'
              )}
            >
              + Add
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className="text-black hover:text-gray-500 transition-colors"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus size={14} strokeWidth={2} />
              </button>
              <span className="text-[12px] font-bold text-black w-3 text-center">{quantity}</span>
              <button
                className="text-black hover:text-gray-500 transition-colors"
                onClick={() => updateQuantity(product.id, quantity + 1)}
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
