import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';
import BottomNav from '../components/BottomNav';
import ToastContainer from '../components/ToastContainer';

export default function MainLayout() {
  const [waNumber, setWaNumber] = useState('919876543210');

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const { data } = await supabase.from('admin_settings').select('value').eq('key', 'mart_phone').single();
        if (data?.value) {
          const digits = data.value.replace(/\D/g, '');
          setWaNumber(digits.startsWith('91') ? digits : '91' + digits);
        }
      } catch (err) {}
    };
    fetchPhone();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-text-dark selection:bg-primary selection:text-white">
      <Header />
      {/* Extra bottom padding on mobile so content doesn't hide behind BottomNav */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      
      {/* Floating Elements */}
      <CartDrawer />
      <AuthModal />
      <BottomNav />
      <ToastContainer />
      
      {/* Floating WhatsApp Button — shifted up on mobile to sit above BottomNav */}
      <a 
        href={`https://wa.me/${waNumber}`}
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
        <span className="hidden md:block absolute right-16 px-2 py-1 bg-surface text-text-dark text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">Order on WhatsApp</span>
      </a>
    </div>
  );
}
