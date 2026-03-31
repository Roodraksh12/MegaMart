import React, { useEffect } from 'react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
  info:    <Info size={18} className="text-blue-500 flex-shrink-0" />,
  error:   <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />,
};

function Toast({ toast }) {
  const { removeToast } = useStore();

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), toast.duration ?? 2800);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 min-w-[220px] max-w-[320px] animate-slide-up"
      style={{ pointerEvents: 'auto' }}
    >
      {ICONS[toast.type] || ICONS.info}
      <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useStore();

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-6 md:right-6 z-[200] flex flex-col gap-2 items-center md:items-end" style={{ pointerEvents: 'none' }}>
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  );
}
