import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const Toast = ({ message, description, type, onClose }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 25, stiffness: 400 }}
      className={cn(
        "pointer-events-auto flex items-start w-full max-w-sm gap-3 p-4 rounded-xl shadow-xl border",
        "backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800",
        "hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[type] || icons.info}</div>
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-sm text-foreground leading-tight">
          {message}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground leading-snug">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded-md text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
