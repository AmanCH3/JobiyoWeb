import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, KeyRound, Loader2, ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation } from '../../api/authApi';
import Lottie from "lottie-react";
import forgotAnimation from "@/lottie/forgot_screen.json";
import PasswordStrengthMeter from '@/components/shared/PasswordStrengthMeter';
import { validatePasswordPolicy, getPasswordRequirements } from '@/utils/passwordPolicy';

const ForgotPassword = () => {
    const { toast } = useToast();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Password requirements for display
    const passwordRequirements = getPasswordRequirements();

    // API Mutations
    const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
    const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

    // Forms
    const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors }, setValue: setEmailValue } = useForm();
    const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors }, setValue: setOtpValue } = useForm();
    const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch, formState: { errors: passwordErrors }, setError } = useForm();

    const watchedPassword = watch('password', '');

    // Magic Link Handler
    useEffect(() => {
        const urlEmail = searchParams.get('email');
        const urlOtp = searchParams.get('otp');

        if (urlEmail && urlOtp) {
            setEmail(urlEmail);
            setOtp(urlOtp);
            setEmailValue('email', urlEmail);
            setOtpValue('otp', urlOtp);
            setStep(2);

            // Auto-verify if params exist
            verifyMagicLink(urlEmail, urlOtp);
        }
    }, [searchParams]);

    const verifyMagicLink = async (urlEmail, urlOtp) => {
        try {
            await verifyOtp({ email: urlEmail, otp: urlOtp }).unwrap();
            toast.success('OTP verified automatically!');
            setStep(3);
        } catch (error) {
            toast.error(error?.data?.message || 'Invalid or expired link');
        }
    };

    const onEmailSubmit = async (data) => {
        try {
            await forgotPassword({ email: data.email }).unwrap();
            setEmail(data.email);
            setStep(2);
            toast.success('OTP sent to your email');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to send OTP');
        }
    };

    const onOtpSubmit = async (data) => {
        try {
            await verifyOtp({ email, otp: data.otp }).unwrap();
            setOtp(data.otp);
            setStep(3);
            toast.success('OTP verified successfully');
        } catch (error) {
            toast.error(error?.data?.message || 'Invalid or expired OTP');
        }
    };

    const onPasswordSubmit = async (data) => {
        // Frontend validation
        const validation = validatePasswordPolicy(data.password, { email });
        if (!validation.isValid) {
            validation.errors.forEach(err => toast.error(err));
            setError('password', { type: 'manual', message: validation.errors[0] });
            return;
        }

        try {
            await resetPassword({ email, otp, newPassword: data.password }).unwrap();
            toast.success('Password reset successfully');
            navigate('/login');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-gray-900">
                 <div className="absolute top-8 left-8">
                     <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                         <ArrowLeft className="w-4 h-4" /> Back to Login
                     </Link>
                 </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-4">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold font-philosopher text-gray-900 dark:text-white">
                            {step === 1 && 'Forgot Password?'}
                            {step === 2 && 'Enter Verification Code'}
                            {step === 3 && 'Reset Password'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {step === 1 && 'Enter your email to receive a verification code.'}
                            {step === 2 && `We sent a code to ${email}`}
                            {step === 3 && 'Create a new secure password.'}
                        </p>
                    </div>

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        {...registerEmail('email', { 
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        type="email"
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {emailErrors.email && <p className="text-xs text-red-500">{emailErrors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingOtp}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Input */}
                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        {...registerOtp('otp', { 
                                            required: 'OTP is required',
                                            minLength: { value: 6, message: 'OTP must be 6 digits' },
                                            maxLength: { value: 6, message: 'OTP must be 6 digits' }
                                        })}
                                        type="text"
                                        maxLength={6}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none tracking-widest text-center font-mono text-lg"
                                        placeholder="000000"
                                    />
                                </div>
                                {otpErrors.otp && <p className="text-xs text-red-500">{otpErrors.otp.message}</p>}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={isVerifyingOtp}
                                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Change Email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        {...registerPassword('password', { 
                                            required: 'Password is required',
                                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                        })}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.password && <p className="text-xs text-red-500">{passwordErrors.password.message}</p>}
                                
                                {/* Password Requirements Checklist */}
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Password Requirements:</p>
                                    <ul className="space-y-1">
                                        {passwordRequirements.map((req) => {
                                            const isMet = watchedPassword && req.check(watchedPassword);
                                            return (
                                                <li key={req.id} className="flex items-center gap-2 text-xs">
                                                    {isMet ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                                                    )}
                                                    <span className={isMet ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                                                        {req.label}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                
                                <PasswordStrengthMeter password={watchedPassword} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        {...registerPassword('confirmPassword', { 
                                            validate: (val) => {
                                                if (!val) {
                                                    return "Please confirm your password";
                                                }
                                                if (watch("password") !== val) {
                                                    return "Your passwords do not match";
                                                }
                                            }
                                        })}
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && <p className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isResettingPassword}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Side - Lottie Animation */}
            <div className="hidden bg-gray-50 dark:bg-gray-800 lg:flex items-center justify-center p-12">
                <div className="w-full max-w-lg">
                     <Lottie animationData={forgotAnimation} loop={true} />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
