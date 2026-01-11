import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';
import { useLoginMutation, useRegisterMutation, useGoogleAuthMutation } from "@/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/userSlice";
import { Loader2, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";
import Navbar from "@/components/shared/Navbar";

// Schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["student", "recruiter", "admin"], { required_error: "You must select a role." }),
});

const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["student", "recruiter"], { required_error: "You must select a role." }),
});

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerUser, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [googleAuth] = useGoogleAuthMutation();
  
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Update state when route changes
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
  });

  const currentForm = isLogin ? loginForm : registerForm;
  const selectedRole = currentForm.watch('role');
  const password = registerForm.watch('password', '');

  const handleToggle = (toLogin) => {
    setIsLogin(toLogin);
    navigate(toLogin ? '/login' : '/register', { replace: true });
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setRecaptchaToken(null);
  };

  const handleGoogleSuccess = async (response) => {
    if (!selectedRole) {
      toast.error(`Please select a role before signing ${isLogin ? 'in' : 'up'} with Google.`);
      return;
    }

    try {
      const result = await googleAuth({ idToken: response.credential, role: selectedRole }).unwrap();
      dispatch(setCredentials(result.data));
      toast.success(`Google ${isLogin ? 'login' : 'registration'} successful!`);
      const userRole = result.data.user.role;
      const targetPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/';
      navigate(targetPath);
    } catch (err) {
      toast.error(err.data?.message || "Google Authentication failed.");
    }
  };

  const onLoginSubmit = async (data) => {
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    const promise = loginUser({ ...data, recaptchaToken }).unwrap();
    toast.promise(promise, {
      loading: 'Logging in...',
      success: (result) => {
        dispatch(setCredentials(result.data));
        const userRole = result.data.user.role;
        const targetPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/';
        navigate(targetPath);
        return result.message || "Login successful!";
      },
      error: (err) => {
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return err.data?.message || "Login failed. Please check your credentials.";
      }
    });
  };

  const onRegisterSubmit = async (data) => {
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      const result = await registerUser({ ...data, recaptchaToken }).unwrap();
      toast.success(result.message || "Registration successful! Please log in.");
      handleToggle(true); // Switch to login
    } catch (err) {
      toast.error(err.data?.message || "Registration failed. Please try again.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Use the main Navbar component */}
      <Navbar />

      {/* Main Content - Add padding top for fixed navbar */}
      <div className="flex-1 flex overflow-hidden pt-20">
        {/* Left Side - Form (for Login) / Image (for Register) */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto"
            >
              <div className="w-full max-w-md">
                {/* Toggle Button */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-full p-1 relative">
                    <motion.div
                      className="absolute h-[calc(100%-8px)] top-1 bg-emerald-600 rounded-full shadow-md"
                      initial={false}
                      animate={{
                        left: isLogin ? '4px' : 'calc(50% + 2px)',
                        width: 'calc(50% - 6px)',
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button 
                      onClick={() => handleToggle(true)}
                      className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${isLogin ? 'text-white' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                      Log In
                    </button>
                    <button 
                      onClick={() => handleToggle(false)}
                      className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${!isLogin ? 'text-white' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome</h1>
                  <h1 className="text-4xl font-bold text-emerald-600">back!</h1>
                  <p className="text-gray-500 mt-3">Log in to your Jobiyo account to continue</p>
                </div>

                {/* Login Form */}
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <Input 
                    type="email" 
                    placeholder="Email address" 
                    className="h-12 rounded-lg border-gray-200 focus:border-emerald-500"
                    {...loginForm.register("email")} 
                  />
                  {loginForm.formState.errors.email && <p className="text-red-500 text-xs">{loginForm.formState.errors.email.message}</p>}

                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      className="h-12 rounded-lg border-gray-200 focus:border-emerald-500 pr-10"
                      {...loginForm.register("password")} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm text-emerald-600 hover:underline">Forgot password?</Link>
                  </div>
                  {loginForm.formState.errors.password && <p className="text-red-500 text-xs">{loginForm.formState.errors.password.message}</p>}

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Log in as...</Label>
                    <RadioGroup onValueChange={(value) => loginForm.setValue('role', value, { shouldValidate: true })} className="flex gap-3">
                      {['student', 'recruiter', 'admin'].map((role) => (
                        <div key={role} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === role ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                          <RadioGroupItem value={role} id={`login-${role}`} />
                          <Label htmlFor={`login-${role}`} className="cursor-pointer font-medium text-sm capitalize">
                            {role === 'student' ? 'Job Seeker' : role}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {loginForm.formState.errors.role && <p className="text-red-500 text-xs">{loginForm.formState.errors.role.message}</p>}
                  </div>

                  <div className="flex justify-center">
                    <ReCAPTCHA ref={recaptchaRef} sitekey="6LfnlpUrAAAAAF0r2A5A1E4RFgQHph8dONQAVndb" onChange={setRecaptchaToken} onExpired={() => setRecaptchaToken(null)} />
                  </div>

                  <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold" disabled={isLoginLoading}>
                    {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-slate-900 px-4 text-gray-500">or continue with</span></div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Login Failed")} useOneTap theme="outline" shape="circle" size="large" locale="en" />
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account? <button onClick={() => handleToggle(false)} className="text-emerald-600 font-semibold hover:underline">Sign Up</button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register-image"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600" />
              <div className="absolute -right-20 top-0 bottom-0 w-40 bg-white dark:bg-slate-900" style={{ borderRadius: '100% 0 0 100% / 50%' }} />
              <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-sm" />
              <div className="absolute bottom-32 right-32 w-40 h-40 bg-white/10 rounded-full blur-sm" />
              <div className="relative z-10 flex items-center justify-center w-full p-12">
                <div style={{ perspective: '1000px' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=600&fit=crop"
                    alt="Professional woman applying for job"
                    className="rounded-3xl shadow-2xl object-cover"
                    style={{ transform: 'rotateY(-8deg) rotateX(2deg)', boxShadow: '20px 20px 60px rgba(0,0,0,0.3)', maxWidth: '380px' }}
                  />
                  <div className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3" style={{ transform: 'rotateY(-5deg) translateZ(30px)' }}>
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"><span className="text-emerald-600 text-xl">✓</span></div>
                    <div><p className="text-sm font-semibold text-gray-800">50,000+</p><p className="text-xs text-gray-500">Happy Users</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side - Image (for Login) / Form (for Register) */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login-image"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-bl from-emerald-400 via-green-500 to-emerald-600" />
              <div className="absolute -left-20 top-0 bottom-0 w-40 bg-white dark:bg-slate-900" style={{ borderRadius: '0 100% 100% 0 / 50%' }} />
              <div className="absolute top-20 right-10 w-24 h-24 bg-white/10 rounded-full blur-sm" />
              <div className="absolute bottom-32 left-32 w-40 h-40 bg-white/10 rounded-full blur-sm" />
              <div className="relative z-10 flex items-center justify-center w-full p-12">
                <div style={{ perspective: '1000px' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=600&fit=crop"
                    alt="Professional recruiter in interview"
                    className="rounded-3xl shadow-2xl object-cover"
                    style={{ transform: 'rotateY(8deg) rotateX(2deg)', boxShadow: '-20px 20px 60px rgba(0,0,0,0.3)', maxWidth: '380px' }}
                  />
                  <div className="absolute -right-4 top-1/4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3" style={{ transform: 'rotateY(5deg) translateZ(30px)' }}>
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"><span className="text-emerald-600 text-xl">👋</span></div>
                    <div><p className="text-sm font-semibold text-gray-800">Welcome Back!</p><p className="text-xs text-gray-500">Good to see you</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto"
            >
              <div className="w-full max-w-md">
                {/* Toggle Button */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-full p-1 relative">
                    <motion.div
                      className="absolute h-[calc(100%-8px)] top-1 bg-emerald-600 rounded-full shadow-md"
                      initial={false}
                      animate={{
                        left: isLogin ? '4px' : 'calc(50% + 2px)',
                        width: 'calc(50% - 6px)',
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button 
                      onClick={() => handleToggle(true)}
                      className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${isLogin ? 'text-white' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                      Log In
                    </button>
                    <button 
                      onClick={() => handleToggle(false)}
                      className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${!isLogin ? 'text-white' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create</h1>
                  <h1 className="text-4xl font-bold text-emerald-600">account</h1>
                </div>

                {/* Register Form */}
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <Input placeholder="Full Name" className="h-12 rounded-lg border-gray-200 focus:border-emerald-500" {...registerForm.register("fullName")} />
                  {registerForm.formState.errors.fullName && <p className="text-red-500 text-xs">{registerForm.formState.errors.fullName.message}</p>}

                  <Input type="email" placeholder="Email address" className="h-12 rounded-lg border-gray-200 focus:border-emerald-500" {...registerForm.register("email")} />
                  {registerForm.formState.errors.email && <p className="text-red-500 text-xs">{registerForm.formState.errors.email.message}</p>}

                  <Input placeholder="Phone Number" className="h-12 rounded-lg border-gray-200 focus:border-emerald-500" {...registerForm.register("phoneNumber")} />
                  {registerForm.formState.errors.phoneNumber && <p className="text-red-500 text-xs">{registerForm.formState.errors.phoneNumber.message}</p>}

                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Password" className="h-12 rounded-lg border-gray-200 focus:border-emerald-500 pr-10" {...registerForm.register("password")} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} />
                  {registerForm.formState.errors.password && <p className="text-red-500 text-xs">{registerForm.formState.errors.password.message}</p>}

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">I am a...</Label>
                    <RadioGroup onValueChange={(value) => registerForm.setValue('role', value)} className="flex gap-4">
                      {['student', 'recruiter'].map((role) => (
                        <div key={role} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${registerForm.watch('role') === role ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                          <RadioGroupItem value={role} id={`register-${role}`} />
                          <Label htmlFor={`register-${role}`} className="cursor-pointer font-medium">{role === 'student' ? 'Job Seeker' : 'Recruiter'}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {registerForm.formState.errors.role && <p className="text-red-500 text-xs">{registerForm.formState.errors.role.message}</p>}
                  </div>

                  <div className="flex justify-center">
                    <ReCAPTCHA ref={recaptchaRef} sitekey="6LfnlpUrAAAAAF0r2A5A1E4RFgQHph8dONQAVndb" onChange={setRecaptchaToken} onExpired={() => setRecaptchaToken(null)} />
                  </div>

                  <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold" disabled={isRegisterLoading}>
                    {isRegisterLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-slate-900 px-4 text-gray-500">or sign up with</span></div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Registration Failed")} theme="outline" shape="circle" size="large" locale="en" />
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                  By creating an account you agree to Jobiyo's <Link to="/terms" className="text-emerald-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
                </p>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Have an account? <button onClick={() => handleToggle(true)} className="text-emerald-600 font-semibold hover:underline">Log in</button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
