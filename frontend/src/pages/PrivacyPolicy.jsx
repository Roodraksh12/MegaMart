import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <ShieldCheck size={22} />
        </div>
        <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
      </div>
      <p className="text-sm text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">1. Information We Collect</h2>
          <p>When you create an account or place an order on SuperMart, we collect your name, email address, phone number, and delivery address. We use this information solely to process and deliver your orders.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To process and fulfill your grocery orders</li>
            <li>To send order confirmation and status updates</li>
            <li>To improve our service and product offerings</li>
            <li>To contact you in case of delivery issues</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">3. Data Security</h2>
          <p>Your account is secured using Firebase Authentication (Google). We do not store your passwords. All data is stored on encrypted, cloud-hosted servers via Supabase and is never sold to third parties.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">4. Third-Party Services</h2>
          <p>We use the following trusted third-party services:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Firebase (Google)</strong> — Authentication</li>
            <li><strong>Supabase</strong> — Database &amp; file storage</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">5. Your Rights</h2>
          <p>You may request deletion of your account and associated data at any time by contacting us. We will process your request within 7 business days.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-text-dark mb-2">6. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please reach out via the contact information in our footer.</p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link to="/" className="text-primary font-medium hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
