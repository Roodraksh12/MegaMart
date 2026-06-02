import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBasket, User, Heart, Menu, Mic } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const { getCartItemCount, toggleCart, toggleAuth, user, products, addToCart, addToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  const handleVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({ message: "Voice search is not supported in this browser.", type: 'error' });
      return;
    }
    
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      addToast({ message: "Listening... Try saying 'Add 2 milk'", type: 'info', duration: 4000 });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Transcript:", transcript);
      
      let addedItems = [];
      // Keep track of matched names so we don't add duplicates for variations
      const matchedNames = new Set();

      products.forEach(product => {
        const prodName = product.name.toLowerCase();
        // A simple match if transcript contains product name
        if (transcript.includes(prodName) || (prodName.length > 3 && transcript.includes(prodName.split(' ')[0]))) {
          if (matchedNames.has(prodName)) return;
          matchedNames.add(prodName);
          
          let qty = 1;
          const words = transcript.split(' ');
          const idx = words.findIndex(w => w.includes(prodName.split(' ')[0]));
          
          if (idx > 0) {
            const prevWord = words[idx - 1];
            if (!isNaN(parseInt(prevWord))) qty = parseInt(prevWord);
            else if (prevWord === 'two') qty = 2;
            else if (prevWord === 'three') qty = 3;
            else if (prevWord === 'four') qty = 4;
            else if (prevWord === 'five') qty = 5;
          }
          
          addToCart(product.id, qty);
          addedItems.push(`${qty}x ${product.name}`);
        }
      });

      if (addedItems.length > 0) {
        addToast({ message: `🎙️ Voice added: ${addedItems.join(', ')}`, type: 'success', duration: 5000 });
      } else {
        addToast({ message: `🎙️ Heard: "${transcript}", but couldn't match products.`, type: 'info', duration: 4000 });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };


  return (
    <header className="sticky top-0 sm:top-4 z-40 transition-all max-w-7xl mx-auto sm:px-6 lg:px-8 mb-4 sm:mb-6">
      <div className="glass-panel sm:glass-pill border-t-0 border-x-0 sm:border-t sm:border-x flex items-center h-[72px] gap-6 px-4 md:px-6">

        {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isAdminPage && (
              <button className="md:hidden p-2 -ml-2 text-primary hover:bg-surface-container-low rounded-full transition-colors" aria-label="Open menu">
                <Menu size={24} strokeWidth={1.8} />
              </button>
            )}
            <Link to="/">
              <span className="font-headline font-bold text-2xl text-primary tracking-tight">
                MegaMart
              </span>
            </Link>
          </div>

          {/* Search — desktop only */}
        {!isAdminPage && (
          <div className="hidden md:flex flex-1 items-center bg-white/40 border border-white/50 shadow-inner rounded-full px-4 py-2.5 group focus-within:ring-2 focus-within:ring-primary/50 transition-all relative">
            <Search size={15} className="text-on-surface-variant mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for fresh produce, dairy, pantry staples..."
                className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm font-body text-on-surface placeholder:text-outline"
                value={searchQuery}
                onChange={handleSearch}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                onFocus={() => { if (searchQuery.length > 1) setIsSearchOpen(true); }}
              />
              <button
                type="button"
                onClick={handleVoiceCommand}
                className={`ml-2 p-1.5 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-primary hover:bg-primary/10'}`}
                title="Voice Search"
              >
                <Mic size={18} strokeWidth={isListening ? 2.5 : 1.8} />
              </button>
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-ambient-lg overflow-hidden z-50">
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                    >
                      <span className="text-xl w-7 text-center">{product.image?.startsWith('http') ? '📦' : product.image}</span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{product.name}</p>
                        <p className="text-xs text-on-surface-variant">{product.unit} · ₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Right actions */}
          {!isAdminPage && (
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search icon — mobile only */}
              <button
                id="mobile-search-toggle"
                className="md:hidden p-2 text-primary hover:scale-95 transition-transform"
                onClick={() => setMobileSearchVisible(v => !v)}
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>
              
              <button
                className={`md:hidden p-2 transition-transform ${isListening ? 'text-red-500 animate-pulse scale-110' : 'text-primary hover:scale-95'}`}
                onClick={handleVoiceCommand}
                aria-label="Voice Search"
              >
                <Mic size={20} strokeWidth={isListening ? 2.5 : 1.8} />
              </button>

              <Link to="/wishlist" className="hidden sm:flex p-2 text-primary hover:scale-95 transition-transform">
                <Heart size={20} strokeWidth={1.8} />
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-2 text-primary hover:scale-95 transition-transform">
                    <User size={20} strokeWidth={1.8} />
                    <span className="hidden md:block text-xs font-bold font-headline tracking-tight">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <Link to="/orders" className="block px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors">My Orders</Link>
                    <Link to="/wishlist" className="block px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors">Wishlist</Link>
                    <div className="h-px bg-surface-container" />
                    <button
                      onClick={() => useStore.getState().logout()}
                      className="block w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-container-low transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={toggleAuth}
                  className="flex items-center gap-1.5 p-2 text-primary hover:scale-95 transition-transform"
                >
                  <User size={20} strokeWidth={1.8} />
                  <span className="hidden md:block text-xs font-bold font-headline tracking-tight">Sign In</span>
                </button>
              )}

              <button
                onClick={toggleCart}
                className="relative flex items-center gap-2 p-2 text-primary hover:scale-95 transition-transform"
                aria-label="Open cart"
              >
                <ShoppingBasket size={22} strokeWidth={1.8} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

      {/* Mobile search row */}
      {!isAdminPage && mobileSearchVisible && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 p-3 glass-panel rounded-2xl animate-fade-in z-50">
          <div className="flex items-center bg-white/50 border border-white/50 shadow-inner rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <Search size={15} className="text-on-surface-variant mr-2.5 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search for essentials..."
              className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm font-body text-on-surface placeholder:text-outline"
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              onFocus={() => { if (searchQuery.length > 1) setIsSearchOpen(true); }}
            />
          </div>
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden z-50">
              {searchResults.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={closeMobileSearch}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                >
                  <span className="text-xl w-7 text-center">{product.image?.startsWith('http') ? '📦' : product.image}</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{product.name}</p>
                    <p className="text-xs text-on-surface-variant">{product.unit} · ₹{product.price}</p>
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
