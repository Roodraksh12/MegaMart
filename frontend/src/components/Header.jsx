import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

export default function Header() {
  const { getCartItemCount, toggleCart, toggleAuth, user, products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const cartItemCount = getCartItemCount();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const results = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results.slice(0, 5));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 cursor-pointer">
            <Link to="/" className="flex flex-col">
              <span className="font-display font-bold text-2xl md:text-3xl tracking-tight text-primary">
                SuperMart
              </span>
              <span className="text-[10px] md:text-xs text-text-muted hidden sm:block">
                Fresh from the shelves
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          {!isAdminPage && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search for groceries, vegetables, or brands..."
                className="w-full bg-surface border border-gray-200 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                value={searchQuery}
                onChange={handleSearch}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                onFocus={() => { if(searchQuery.length > 1) setIsSearchOpen(true) }}
              />
              <div className="absolute inset-y-0 right-0 py-1 pr-1">
                <button className="bg-primary text-white p-2 rounded-full hover:bg-primary-light transition-colors">
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-gray-100 rounded-xl shadow-lg overflow-hidden py-2 animate-fade-in z-50">
                {searchResults.map(product => (
                  <Link 
                    key={product.id}
                    to="/"
                    className="flex items-center space-x-4 px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl">{product.image}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-dark">{product.name}</p>
                      <p className="text-xs text-text-muted">{product.unit} • ₹{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Right Actions */}
          {!isAdminPage && (
            <div className="flex items-center space-x-3 md:space-x-6">
            
            <button className="md:hidden text-text-dark hover:text-primary transition-colors">
              <Search size={24} />
            </button>
            
            <Link to="/wishlist" className="hidden sm:flex text-text-dark hover:text-primary transition-colors group relative">
              <Heart size={24} />
            </Link>

            {user ? (
              <div className="text-text-dark hover:text-primary transition-colors flex items-center gap-2 group relative cursor-pointer">
                <User size={24} />
                <span className="hidden lg:block text-sm font-medium">
                  {user.name.split(' ')[0]}
                </span>
                
                {/* Profile Dropdown if logged in */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 text-text-dark">My Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50 text-text-dark">Wishlist</Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); useStore.getState().logout() }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={toggleAuth} 
                className="text-text-dark hover:text-primary transition-colors flex items-center gap-2 group relative cursor-pointer"
              >
                <User size={24} />
                <span className="hidden lg:block text-sm font-medium">Sign In</span>
              </button>
            )}

            <button 
              onClick={toggleCart}
              className="text-text-dark hover:text-primary transition-colors flex items-center gap-2 relative bg-surface p-2 rounded-full shadow-sm border border-gray-100"
            >
              <div className="relative">
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className={cn(
                    "absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full transition-all duration-300",
                    "animate-bounce-soft"
                  )}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-sm font-bold">Cart</span>
            </button>
          </div>
          )}
        </div>
      </div>
    </header>
  );
}
