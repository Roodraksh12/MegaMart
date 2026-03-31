import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <RefreshCw size={22} />
        </div>
        <h1 className="text-3xl font-display font-bold">Refund &amp; Return Policy</h1>
      </div>
      <p className="text-sm text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">1. Cancellation Window</h2>
          <p>You can cancel your order within <strong>30 seconds</strong> of placing it directly from the "My Orders" page. After 30 seconds, the order enters our fulfillment queue and cannot be cancelled automatically.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">2. Damaged or Wrong Items</h2>
          <p>If you receive a damaged, spoiled, or incorrect item, you are eligible for a full refund or replacement. Please report the issue within <strong>2 hours of delivery</strong> by contacting us with your Order ID.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">3. Non-Returnable Items</h2>
          <p>Due to the perishable nature of groceries, we do not accept returns on fresh produce, dairy, meat, or bakery items once they have been delivered in good condition.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">4. Refund Processing</h2>
          <p>Since we operate on Cash on Delivery (COD), refunds are issued as <strong>store credit</strong> or via bank transfer within 3–5 business days after the issue is verified by our team.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">5. Missing Items</h2>
          <p>If an item is missing from your order, we will deliver it at no extra cost in the next available slot, or issue a full refund for that item.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">6. Contact Us</h2>
          <p>For any refund or return requests, please contact our customer support with your Order ID. We aim to resolve all issues within 24 hours.</p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link to="/" className="text-primary font-medium hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
