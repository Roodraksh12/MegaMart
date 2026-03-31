import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import { Orders, Wishlist } from './pages/Orders';
import { useStore } from './store/useStore';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';

function App() {
  const { startLiveSync } = useStore();

  useEffect(() => {
    startLiveSync();
  }, [startLiveSync]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="refund" element={<RefundPolicy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
