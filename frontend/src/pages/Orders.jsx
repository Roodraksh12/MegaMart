import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, HelpCircle, Repeat } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';

export function Orders() {
  const { orders, addToCart, toggleCart, user } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted">
        <h2 className="text-2xl font-bold mb-4">Please login to view orders</h2>
      </div>
    );
  }

  const handleReorder = (items) => {
    items.forEach(item => addToCart(item.id, item.quantity));
    toggleCart();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">My Orders</h1>
          <p className="text-sm text-text-muted">Track, return, or order items again.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto opacity-50 mb-4">
            <Package size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-medium">No past orders</h2>
          <p className="text-text-muted">You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                   <div>
                     <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Order {order.id}</p>
                     <p className="text-sm">Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <div className="text-right">
                     <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{order.status}</span>
                     <p className="font-bold text-lg mt-1">₹{order.total.toFixed(2)}</p>
                   </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                  {order.items.map(item => (
                    <div key={item.id} className="min-w-[60px] flex flex-col items-center">
                       <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-1 shadow-sm border border-gray-100">
                         {item.image}
                       </div>
                       <span className="text-xs text-text-muted font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 border border-gray-100">
                      +{order.items.length - 5}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-64 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center space-y-3">
                 <button className="w-full btn-outline py-2 text-sm flex items-center justify-center gap-2">
                   <HelpCircle size={16} /> Need Help?
                 </button>
                 <button 
                  onClick={() => handleReorder(order.items)} 
                  className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                 >
                   <Repeat size={16} /> Reorder All
                 </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Wishlist() {
  const { wishlist, user, products } = useStore();
  const navigate = useNavigate();

  const wishlistProducts = wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted">
        <h2 className="text-2xl font-bold mb-4">Please login to view wishlist</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-3xl font-display font-bold mb-2">Come Back Wishlist</h1>
      <p className="text-text-muted mb-8">Save items for your next basket here.</p>
      
      {wishlistProducts.length === 0 ? (
         <div className="text-center py-20 bg-surface rounded-2xl border border-gray-200">
           <h3 className="text-xl font-medium text-text-muted">Your wishlist is lonely.</h3>
           <p className="text-sm text-gray-400 mt-2">Tap the heart icon on any product to save it here.</p>
           <button onClick={() => navigate('/')} className="mt-6 btn-outline">Explore Products</button>
         </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
