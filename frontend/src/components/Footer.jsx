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
    <footer className="bg-surface-container-low border-t border-surface-container-high pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-headline font-bold text-3xl tracking-tight text-primary">
                MegaMart
              </span>
              <p className="text-sm text-on-surface-variant mt-2 font-body max-w-xs">
                The Digital Larder: High-end, human-centric grocery experience.
              </p>
            </Link>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-on-surface-variant gap-3">
                <Clock size={18} className="text-primary flex-shrink-0" />
                <span>Daily: 7:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center text-sm text-on-surface-variant gap-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span>hello@megamart.store</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-headline font-bold text-lg mb-6 text-on-surface">Experience</h3>
            <ul className="space-y-3 text-sm text-on-surface-variant font-body">
              <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors flex items-center gap-2">Refund Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-2">Privacy & Legal</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-headline font-bold text-lg mb-6 text-on-surface">The Pantry</h3>
            <ul className="space-y-3 text-sm text-on-surface-variant font-body">
              <li><Link to="/" className="hover:text-primary transition-colors">Fresh Produce</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Dairy & Eggs</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Artisanal Bakery</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Beverages</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Household Essentials</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-headline font-bold text-lg mb-6 text-on-surface">Keep in Touch</h3>
            <p className="text-sm text-on-surface-variant mb-6 font-body">
              Join our community for seasonal recipes and fresh arrivals.
            </p>
            {subscribed ? (
              <div className="bg-primary-container text-on-primary-container rounded-xl px-4 py-3 text-sm font-semibold animate-fade-in">
                🌿 You're now on our mailing list.
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubscribe}>
                <div className="relative group">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full bg-surface-container-lowest border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary font-body text-on-surface placeholder:text-outline"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-3 rounded-xl shadow-ambient">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-surface-container flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-on-surface-variant font-body">
            © {new Date().getFullYear()} MegaMart. Crafted for the Modern Pantry.
          </p>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/refund" className="hover:text-primary transition-colors">Terms</Link>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
