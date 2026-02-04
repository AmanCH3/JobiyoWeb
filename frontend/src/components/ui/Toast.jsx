import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Info, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastConfig = {
  success: {
    borderColor: "border-l-emerald-500",
    iconBg: "bg-emerald-500",
    icon: Check,
    title: "Success",
  },
  error: {
    borderColor: "border-l-red-500",
    iconBg: "bg-red-500",
    icon: XCircle,
    title: "Error",
  },
  info: {
    borderColor: "border-l-blue-500",
    iconBg: "bg-blue-500",
    icon: Info,
    title: "Info",
  },
  warning: {
    borderColor: "border-l-yellow-500",
    iconBg: "bg-yellow-500",
    icon: AlertTriangle,
    title: "Warning",
  },
};

const Toast = ({ message, description, type = 'info', onClose }) => {
  const config = toastConfig[type] || toastConfig.info;
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={cn(
        "pointer-events-auto flex items-start w-full max-w-md gap-4 px-4 py-4 rounded-lg shadow-xl",
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-700",
        "border-l-4",
        config.borderColor
      )}
    >
      {/* Circular Icon */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full",
        config.iconBg
      )}>
        <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base text-slate-900 dark:text-white leading-tight">
          {message || config.title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          "flex-shrink-0 p-1.5 rounded-full transition-all duration-150",
          "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          "focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
