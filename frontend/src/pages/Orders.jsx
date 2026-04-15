import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Repeat, X, Printer, MapPin, CreditCard, Clock, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { cn } from '../utils/cn';


// ─── Print Invoice Styles (injected dynamically) ─────────────────────────────
const PRINT_STYLES = `
  @media print {
    body > * { display: none !important; }
    #invoice-print-target { display: block !important; }
    #invoice-print-target { position: fixed; top: 0; left: 0; width: 100%; }
  }
`;

// ─── 30-second Cancel Timer Hook ─────────────────────────────────────────────
function useCancelTimer(orderDate) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const orderMs = new Date(orderDate).getTime();
    const update = () => {
      const elapsed = (Date.now() - orderMs) / 1000;
      const remaining = Math.max(0, 30 - Math.floor(elapsed));
      setSecondsLeft(remaining);
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [orderDate]);

  return secondsLeft;
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({ order, onClose }) {
  const printRef = useRef(null);
  let addr = {};
  try { addr = JSON.parse(order.delivery_address); } catch(e) {}

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1 { color: #22c55e; margin-bottom: 4px; }
            .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f4f4f5; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; color: #666; }
            td { padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-size: 14px; }
            .total-row td { font-weight: bold; background: #f0fdf4; color: #16a34a; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .info-box h3 { font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; }
            .info-box p { font-size: 14px; margin: 2px 0; }
            .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: bold; }
            .footer { margin-top: 32px; color: #999; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
            <p className="text-xs text-gray-400 font-mono">{order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Printer size={15} /> Print Invoice
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Body — also used for print */}
        <div ref={printRef} className="p-6 space-y-6">
          {/* Header for print */}
          <div className="hidden print:block">
            <h1>🛒 SuperMart</h1>
            <p className="sub">Tax Invoice / Receipt</p>
          </div>

          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Placed on</p>
              <p className="font-medium text-sm">
                {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' '}at{' '}
                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
              order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
              order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
              order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            )}>
              {order.status}
            </span>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Address</h3>
              </div>
              <p className="font-semibold text-sm">{addr.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{addr.houseNo}, {addr.street}</p>
              <p className="text-sm text-gray-600">Pincode: {addr.pincode}</p>
              <p className="text-sm text-gray-600">📞 {addr.phone || order.customer_phone || 'N/A'}</p>
              {addr.slot && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                  🕐 Slot: {addr.slot}
                </span>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</h3>
              </div>
              <p className="font-semibold text-sm">{order.payment_method || 'Cash on Delivery'}</p>
              <p className="text-xs text-gray-400 mt-1">Amount Payable</p>
              <p className="text-2xl font-bold text-primary">₹{order.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Item</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Price</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="mr-2">{!item.image?.startsWith('http') ? item.image : '📦'}</span>
                        <span className="font-medium">{item.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">×{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-green-50 border-t-2 border-green-100">
                    <td colSpan={3} className="px-4 py-3 font-bold text-green-800">Total Amount</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">₹{order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400">Thank you for shopping with SuperMart! 🛒</p>
        </div>
      </div>
    </div>
  );
}

// ─── Order Timeline ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'Placed',           label: 'Placed',       icon: '📋' },
  { key: 'Processing',       label: 'Confirmed',    icon: '✅' },
  { key: 'Out for Delivery', label: 'On the Way',   icon: '🚴' },
  { key: 'Delivered',        label: 'Delivered',    icon: '🎉' },
];

const STATUS_INDEX = {
  'Processing': 1,
  'Out for Delivery': 2,
  'Delivered': 3,
  'Cancelled': -1,
};

function OrderTimeline({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-red-50 rounded-xl border border-red-100">
        <span className="text-lg">❌</span>
        <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
      </div>
    );
  }

  // Orders always start at "Placed" (index 0); further progress based on status
  const currentStep = STATUS_INDEX[status] ?? 1;

  return (
    <div className="relative flex items-center justify-between py-2">
      {/* connector bar behind the dots */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full mx-6 z-0" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-0 transition-all duration-700 mx-6"
        style={{ width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
      />

      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center gap-1 min-w-[52px]">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all duration-500',
              done
                ? 'bg-green-500 border-green-500 shadow-md shadow-green-200'
                : 'bg-white border-gray-200',
              active && 'ring-4 ring-green-100'
            )}>
              {done ? (
                <span className="text-sm">{step.icon}</span>
              ) : (
                <span className="w-2 h-2 bg-gray-300 rounded-full" />
              )}
            </div>
            <span className={cn(
              'text-[10px] font-semibold text-center leading-tight',
              done ? 'text-green-700' : 'text-gray-400'
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Single Order Card ────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const cancelSecondsLeft = useCancelTimer(order.date);
  const { cancelOrder } = useStore();
  const [cancelling, setCancelling] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const canCancel = cancelSecondsLeft > 0 && order.status !== 'Cancelled' && order.status !== 'Delivered';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    const success = await cancelOrder(order.id);
    if (!success) alert('Failed to cancel order. Please contact support.');
    setCancelling(false);
  };

  return (
    <>
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}

      <div className={cn(
        "bg-surface-container-low rounded-3xl p-6 shadow-ambient flex flex-col md:flex-row gap-6 transition-all border-none",
        order.status === 'Cancelled' ? 'opacity-60 ring-1 ring-error-container' : ''
      )}>

        <div className="flex-1 space-y-4">
          {/* Order Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Order {order.id}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Clock size={13} />
                {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-xs font-bold px-3 py-1 rounded-full",
                order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              )}>
                {order.status}
              </span>
              <p className="font-bold text-lg mt-1">₹{order.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Tracking Timeline */}
          <OrderTimeline status={order.status} />

          {/* Item Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {order.items.slice(0, 5).map((item, i) => (
              <div key={i} className="min-w-[56px] flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {item.image?.startsWith('http')
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : item.image}
                </div>
                <span className="text-xs text-gray-400 font-medium">×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 5 && (
              <div className="min-w-[56px] w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 border border-gray-100">
                +{order.items.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="md:w-56 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center gap-2.5">

          {/* 30-sec Cancel Button */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2 px-3 rounded-xl text-sm transition-all"
            >
              <XCircle size={15} />
              {cancelling ? 'Cancelling...' : `Cancel Order (${cancelSecondsLeft}s)`}
            </button>
          )}

          {/* View Details / Invoice */}
          <button
            onClick={() => setShowInvoice(true)}
            className="w-full btn-outline py-2 text-sm flex items-center justify-center gap-2"
          >
            <Printer size={15} /> View Details & Invoice
          </button>

          {/* Reorder */}
          {order.status !== 'Cancelled' && (
            <ReorderButton items={order.items} />
          )}
        </div>
      </div>
    </>
  );
}


function ReorderButton({ items }) {
  const { addToCart, toggleCart } = useStore();
  return (
    <button
      onClick={() => { items.forEach(item => addToCart(item.id, item.quantity)); toggleCart(); }}
      className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
    >
      <Repeat size={15} /> Reorder All
    </button>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
export function Orders() {
  const { orders, user } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted">
        <h2 className="text-2xl font-bold mb-4">Please login to view orders</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">My Orders</h1>
          <p className="text-sm text-text-muted">Track your orders, view invoices, and reorder anytime.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6 select-none">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
            Looks like you haven't placed any orders.<br />Start shopping to see them here!
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-8 py-3 rounded-xl text-base"
          >
            🛒 Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
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
        <div className="text-center py-20">
          <div className="text-7xl mb-6 select-none">🩷</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
            Tap the ♡ heart icon on any product to save it here for later.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-outline px-8 py-3 rounded-xl text-base"
          >
            Explore Products
          </button>
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
