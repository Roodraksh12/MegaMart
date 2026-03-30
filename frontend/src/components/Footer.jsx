import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-gray-200 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 flex-wrap lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Address */}
          <div>
            <Link to="/" className="flex flex-col mb-4">
              <span className="font-display font-bold text-3xl tracking-tight text-primary">
                SuperMart
              </span>
              <span className="text-xs text-text-muted mt-1">
                Fresh from the shelves, straight to your door.
              </span>
            </Link>
            <div className="flex items-start text-sm text-text-muted space-x-3 mb-3">
              <MapPin size={18} className="mt-0.5 text-primary flex-shrink-0" />
              <p>123 Grocery Lane, Market Sector 42,<br />Jaipur, Rajasthan 302001</p>
            </div>
            <div className="flex items-center text-sm text-text-muted space-x-3 mb-3">
              <Phone size={18} className="text-primary flex-shrink-0" />
              <p>+91 98765 43210</p>
            </div>
            <div className="flex items-center text-sm text-text-muted space-x-3 mb-3">
              <Clock size={18} className="text-primary flex-shrink-0" />
              <p>Daily: 7:00 AM - 10:00 PM</p>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text-dark">Quick Links</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text-dark">Categories</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/" className="hover:text-primary transition-colors">Vegetables & Fruits</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Dairy & Bakery</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Staples</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Snacks & Beverages</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Personal Care</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
             <h3 className="font-display font-bold text-lg mb-4 text-text-dark">Newsletter</h3>
             <p className="text-sm text-text-muted mb-4">Subscribe for latest offers, fresh arrivals and more.</p>
             <form className="flex mb-4 relative" onSubmit={e => e.preventDefault()}>
               <div className="relative w-full">
                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   type="email" 
                   placeholder="Your email address" 
                   className="w-full bg-background border border-gray-200 rounded-lg py-2.5 pl-10 pr-24 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                 />
                 <button className="absolute right-1 top-1 bottom-1 btn-primary py-1 px-4 text-xs rounded-md">
                   Subscribe
                 </button>
               </div>
             </form>
             <div className="flex space-x-4 mt-6">
                <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="text-xs font-bold">FB</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="text-xs font-bold">IG</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="text-xs font-bold">TW</span>
                </a>
             </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} SuperMart. All rights reserved.
          </p>
          <p className="text-sm font-medium text-text-dark">
            Made with <span className="text-red-500">❤️</span> by SuperMart
          </p>
        </div>
      </div>
    </footer>
  );
}
