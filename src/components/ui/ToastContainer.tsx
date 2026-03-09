import React from 'react';
import { useUIStore, type ToastType } from '../../store/uiStore';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'info': return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-white border border-gray-100 shadow-xl rounded-lg p-4 min-w-[300px] max-w-md transform transition-all duration-300 animate-in slide-in-from-right-5 fade-in"
        >
          {getIcon(toast.type)}
          <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};