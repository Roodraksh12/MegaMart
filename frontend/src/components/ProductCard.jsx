import React, { useState } from 'react';
import { Heart, Plus, Minus, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { RELATED_ITEMS_MAP } from '../data/mockData';
import { cn } from '../utils/cn';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist, products } = useStore();
  const [showToast, setShowToast] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);

  const handleAdd = () => {
    addToCart(product.id, 1);
    
    // Check for "Running Low?" suggestions
    const related = RELATED_ITEMS_MAP[product.id];
    if (related && related.length > 0 && quantity === 0) {
      // Pick the first related item they don't have in cart
      const unboughtRelated = related.filter(id => !cart.some(c => c.id === id));
      if (unboughtRelated.length > 0) {
        const itemObj = products.find(p => p.id === unboughtRelated[0]);
        if (itemObj) {
          setSuggestion(itemObj);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000); // hide after 5s
        }
      }
    }
  };

  return (
    <div className="card-premium group relative flex flex-col h-full bg-surface">
      {/* Toast relative to card */}
      {showToast && suggestion && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 w-max max-w-[200px] bg-gray-900 text-white text-[10px] sm:text-xs py-2 px-3 rounded-lg shadow-xl animate-fade-in text-center pointer-events-none">
          Most customers also grab <b>{suggestion.name}</b>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 w-full pr-6">
        {product.discount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit">
            {product.discount}% OFF
          </span>
        )}
        {product.stockLevel === 'low' && (
          <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit text-left break-all max-w-[80%]">
            Only a few left!
          </span>
        )}
        {product.isFresh && (
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit flex items-center gap-1">
            🌱 Fresh Today
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button 
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
      >
        <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
      </button>

      {/* Image Area */}
      <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-4 overflow-hidden rounded-t-xl group-hover:bg-primary/5 transition-colors">
        <div className="text-6xl sm:text-8xl transition-transform duration-300 group-hover:scale-110 select-none">
          {product.image}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white font-bold px-3 py-1 rounded-full text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs text-text-muted mb-1">{product.unit}</span>
        <h3 className="font-medium text-text-dark text-sm sm:text-base line-clamp-2 leading-tight flex-1">
          {product.name}
        </h3>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-text-muted line-through">₹{product.mrp}</span>
              )}
            </div>
          </div>
          
          {/* Action Button */}
          {quantity === 0 ? (
            <button 
              onClick={handleAdd}
              disabled={!product.inStock}
              className={cn(
                "btn-outline py-1 px-4 border-gray-200 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary min-w-[80px]",
                !product.inStock && "opacity-50 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400 hover:border-gray-200"
              )}
            >
              Add
            </button>
          ) : (
            <div className="flex items-center bg-primary text-white rounded-lg overflow-hidden h-8 w-[80px]">
              <button 
                className="flex-1 flex items-center justify-center h-full hover:bg-primary-dark transition-colors"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus size={14} />
              </button>
              <span className="px-2 font-medium text-sm">
                {quantity}
              </span>
              <button 
                className="flex-1 flex items-center justify-center h-full hover:bg-primary-dark transition-colors"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
