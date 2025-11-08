
import React, { useEffect, useState } from 'react';
import type { ToastMessage } from '../types';

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);
  
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white max-w-sm z-50 transition-all duration-300";
  const typeClasses = {
    success: 'bg-gradient-to-br from-green-500 to-emerald-600',
    error: 'bg-gradient-to-br from-red-500 to-rose-600',
  };
  const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
      <div className="flex items-center justify-between">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className="ml-4 text-white/70 hover:text-white">&times;</button>
      </div>
    </div>
  );
};

export default Toast;
