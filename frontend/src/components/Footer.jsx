import React, { useState } from 'react';
import { Mail, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-surface border-t border-gray-200 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 flex-wrap lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div>
            <Link to="/" className="flex flex-col mb-4">
              <span className="font-display font-bold text-3xl tracking-tight text-primary">
                SuperMart
              </span>
              <span className="text-xs text-text-muted mt-1">
                Fresh from the shelves, straight to your door.
              </span>
            </Link>
            <div className="flex items-center text-sm text-text-muted space-x-3 mb-3">
              <Clock size={18} className="text-primary flex-shrink-0" />
              <p>Daily: 7:00 AM – 10:00 PM</p>
            </div>
            <div className="flex items-center text-sm text-text-muted space-x-3">
              <Mail size={18} className="text-primary flex-shrink-0" />
              <p>support@supermart.store</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text-dark">Quick Links</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors flex items-center gap-1.5"><RefreshCw size={13} /> Refund Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1.5"><ShieldCheck size={13} /> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text-dark">Categories</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/" className="hover:text-primary transition-colors">Vegetables &amp; Fruits</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Dairy &amp; Bakery</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Staples</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Snacks &amp; Beverages</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Cleaning &amp; Personal Care</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text-dark">Stay Updated</h3>
            <p className="text-sm text-text-muted mb-4">Subscribe for fresh deals and new arrivals.</p>
            {subscribed ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
                ✅ Thanks! You're on the list.
              </div>
            ) : (
              <form className="flex mb-4 relative" onSubmit={handleSubscribe}>
                <div className="relative w-full">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full bg-background border border-gray-200 rounded-lg py-2.5 pl-10 pr-24 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button type="submit" className="absolute right-1 top-1 bottom-1 btn-primary py-1 px-4 text-xs rounded-md">
                    Subscribe
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} SuperMart. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
