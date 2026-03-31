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
    <header className="sticky top-0 z-40 bg-white border-b border-black/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[72px] gap-6">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-black text-2xl text-black tracking-tighter uppercase italic pr-2">SUPERMART</span>
          </Link>

          {/* Search — desktop only */}
          {!isAdminPage && (
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for essentials..."
                  className="w-full bg-transparent border-b-2 border-black/20 rounded-none py-2 pl-9 pr-4 text-sm font-semibold focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 placeholder:font-normal"
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
                className="md:hidden p-2 text-black hover:text-gray-500 transition-colors"
                onClick={() => setMobileSearchVisible(v => !v)}
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>

              <Link to="/wishlist" className="hidden sm:flex p-2 text-black hover:text-gray-500 transition-colors">
                <Heart size={20} />
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-2 text-black hover:text-gray-500 transition-colors">
                    <User size={20} />
                    <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">{user.name.split(' ')[0]}</span>
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
                  className="flex items-center gap-1.5 p-2 text-black hover:text-gray-500 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">Sign In</span>
                </button>
              )}

              <button
                onClick={toggleCart}
                className="relative flex items-center gap-2 text-black hover:text-gray-500 transition-colors uppercase text-[11px] font-bold tracking-widest pl-2"
              >
                <span className="hidden sm:block">Cart</span>
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
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
              placeholder="Search for essentials..."
              className="w-full bg-transparent border-b-2 border-black/20 rounded-none py-2 pl-9 pr-4 text-sm font-semibold focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 placeholder:font-normal"
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
