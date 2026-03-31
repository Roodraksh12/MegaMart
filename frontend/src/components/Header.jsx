import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const { getCartItemCount, toggleCart, toggleAuth, user, products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const cartItemCount = getCartItemCount();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const closeMobileSearch = () => {
    setMobileSearchVisible(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/30 backdrop-blur-2xl border-b border-white/50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-bold text-xl text-primary tracking-tight">SuperMart</span>
          </Link>

          {/* Search — desktop only */}
          {!isAdminPage && (
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groceries..."
                  className="w-full bg-white/40 border border-white/60 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white/60 focus:border-white shadow-soft transition-all placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={handleSearch}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  onFocus={() => { if (searchQuery.length > 1) setIsSearchOpen(true); }}
                />
              </div>
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl w-7 text-center">{product.image?.startsWith('http') ? '📦' : product.image}</span>
                      <div>
                        <p className="text-sm font-medium text-text-dark">{product.name}</p>
                        <p className="text-xs text-text-muted">{product.unit} · ₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spacer — pushes right actions to the end on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Right actions */}
          {!isAdminPage && (
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search icon — mobile only */}
              <button
                id="mobile-search-toggle"
                className="md:hidden p-2 text-gray-500 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
                onClick={() => setMobileSearchVisible(v => !v)}
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>

              <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-500 hover:text-primary transition-colors rounded-md hover:bg-gray-100">
                <Heart size={20} />
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-primary transition-colors rounded-md hover:bg-gray-100">
                    <User size={20} />
                    <span className="hidden md:block text-sm font-medium">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-text-dark">My Orders</Link>
                    <Link to="/wishlist" className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-text-dark">Wishlist</Link>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={() => useStore.getState().logout()}
                      className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={toggleAuth}
                  className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
                >
                  <User size={20} />
                  <span className="hidden md:block text-sm font-medium">Sign In</span>
                </button>
              )}

              <button
                onClick={toggleCart}
                className="relative flex items-center gap-1.5 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-900 hover:shadow-glass hover:-translate-y-0.5 transition-all active:scale-95 border border-white/10"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:block">Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-white text-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search — mobile expandable row (below header bar) */}
      {!isAdminPage && mobileSearchVisible && (
        <div className="md:hidden border-t border-gray-100 px-4 py-2 bg-white relative">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search groceries..."
              className="w-full bg-white/40 border border-white/60 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white/60 focus:border-white shadow-soft transition-all placeholder:text-gray-400"
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              onFocus={() => { if (searchQuery.length > 1) setIsSearchOpen(true); }}
            />
          </div>
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 bg-white border border-gray-200 rounded-b-md shadow-lg overflow-hidden z-50">
              {searchResults.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={closeMobileSearch}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl w-7 text-center">{product.image?.startsWith('http') ? '📦' : product.image}</span>
                  <div>
                    <p className="text-sm font-medium text-text-dark">{product.name}</p>
                    <p className="text-xs text-text-muted">{product.unit} · ₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
