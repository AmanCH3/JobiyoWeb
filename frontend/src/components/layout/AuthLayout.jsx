import React from 'react';
import Lottie from 'lottie-react';
import teamAnimation from '@/lottie/team.json';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
    return (
        <div className="w-full lg:min-h-screen lg:grid lg:grid-cols-2 relative overflow-hidden bg-white dark:bg-gray-900">
            {/* Form Section - Fixed Left */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10 perspective-1000">
                <motion.div 
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: -100, rotateY: -15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ 
                        duration: 0.6, 
                        type: "spring", 
                        stiffness: 100,
                        damping: 15
                    }}
                >
                    {children}
                </motion.div>
            </div>

            {/* Lottie Animation Section - Fixed Right */}
            <div className="hidden lg:flex items-center justify-center relative bg-white dark:bg-gray-900">
                <motion.div 
                    className="w-full max-w-lg"
                    initial={{ opacity: 0, scale: 0.8, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ 
                        duration: 0.8, 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 80
                    }}
                >
                    <Lottie animationData={teamAnimation} loop={true} />
                </motion.div>
                
                {/* Decorative 3D elements */}
                <motion.div 
                    className="absolute -z-10 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0], 
                    }}
                    transition={{ 
                        duration: 20, 
                        repeat: Infinity,
                        repeatType: "reverse" 
                    }}
                />
            </div>
        </div>
    );
};

export default AuthLayout;
