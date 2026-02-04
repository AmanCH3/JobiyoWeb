import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CheckCircle className="w-5 h-5 text-white" fill="rgb(16, 185, 129)" />,
        error: <AlertCircle className="w-5 h-5 text-white" fill="rgb(239, 68, 68)" />,
        info: <Info className="w-5 h-5 text-white" fill="rgb(59, 130, 246)" />,
        warning: <AlertTriangle className="w-5 h-5 text-white" fill="rgb(245, 158, 11)" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-950 group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:border-slate-100 group-[.toaster]:dark:border-slate-800 group-[.toaster]:border group-[.toaster]:border-l-4 " +
            "data-[type=success]:border-l-emerald-500 " +
            "data-[type=error]:border-l-red-500 " +
            "data-[type=info]:border-l-blue-500 " +
            "data-[type=warning]:border-l-amber-500",
          description: "group-[.toast]:text-muted-foreground font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-semibold rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-semibold rounded-lg",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
