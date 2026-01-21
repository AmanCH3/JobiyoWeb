import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '@/components/ui/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((messageOrOptions, type = 'info', options = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Support both (message, type, options) and ({ message, description, type, ...options })
    let newToast;
    if (typeof messageOrOptions === 'object') {
      newToast = { id, type: messageOrOptions.type || type, ...messageOrOptions };
    } else {
      newToast = { id, message: messageOrOptions, type, ...options };
    }
    
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    const duration = newToast.duration ?? 4000;
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options) => addToast(message, 'success', options),
    error: (message, options) => addToast(message, 'error', options),
    info: (message, options) => addToast(message, 'info', options),
    warning: (message, options) => addToast(message, 'warning', options),
    // New: Support object-based toast for more control
    custom: (options) => addToast(options),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-md w-full px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
