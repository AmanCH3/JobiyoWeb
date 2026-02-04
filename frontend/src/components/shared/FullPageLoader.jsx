import { Loader2 } from "lucide-react";

const FullPageLoader = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm transition-all duration-300">
            <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900 opacity-20 animate-ping h-16 w-16"></div>
                
                {/* Spinner */}
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            </div>
            
            {/* Text */}
            <div className="mt-8 text-center space-y-2 animate-pulse">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white tracking-wide">
                    {message}
                </h3>
            </div>
        </div>
    );
};

export default FullPageLoader;
