import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { useLoginMutation, useVerifyLoginOtpMutation, useGoogleAuthMutation } from "@/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/redux/slices/userSlice";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { AlertTriangle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["student", "recruiter", "admin"], { required_error: "You must select a role." }),
});

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const [verifyLoginOtp, { isLoading: isVerifying }] = useVerifyLoginOtpMutation();
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  
  // Password Expiry Dialog State
  const [showPasswordExpiredDialog, setShowPasswordExpiredDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState({ role: '', path: '' });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const selectedRole = watch('role');

  const handleGoogleSuccess = async (tokenResponse) => {
    if (!selectedRole) {
      toast.error("Please select a role before signing in with Google.");
      return;
    }

    try {
      const result = await googleAuth({ accessToken: tokenResponse.access_token, role: selectedRole }).unwrap();
      dispatch(setCredentials(result.data));
      toast.success("Google login successful!");
      const userRole = result.data.user.role;
      const targetPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/';
      navigate(targetPath);
    } catch (err) {
      toast.error(err.data?.message || "Google Authentication failed.");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google Login Failed"),
  });

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const result = await verifyLoginOtp({ email: tempEmail, otp }).unwrap();
      dispatch(setCredentials(result.data));
      setShow2FA(false);
      const userRole = result.data.user.role;
      const targetPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/';
      navigate(targetPath);
      toast.success("Login verified successfully!");
    } catch (err) {
      toast.error(err.data?.message || "Verification failed. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      const result = await loginUser({ ...data, recaptchaToken }).unwrap();
      
      // Check if 2FA verification is required
      if (result.data?.requiresVerification) {
        setTempEmail(result.data.email);
        setShow2FA(true);
        toast.info("Please check your email for verification code.");
        return;
      }

      dispatch(setCredentials(result.data));
      const userRole = result.data.user.role;
      const targetPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/';
      
      // Check if password is expired and show warning dialog
      if (result.data.passwordExpired) {
        setPendingNavigation({ role: userRole, path: targetPath });
        setShowPasswordExpiredDialog(true);
        return;
      }
      
      navigate(targetPath);
      toast.success("Login successful!");
    } catch (err) {
        console.error("Login Error Object:", err);
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        
        if (err.status === 403 && err.data?.requiresVerification) {
            toast.error("Email verification required. Please check your email for the activation link or code.");
            return;
        }

        toast.error(err.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Full Width Navbar with White Background */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-4 px-8 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-evenly">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Jobiyo" className="h-9 w-9" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Jobiyo
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Find Jobs</Link>
            <Link to="/companies" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Companies</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-emerald-600">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Form Left, Image Right (Swapped) */}
      <div className="flex-1 flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Toggle Button */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-full p-1">
                <Link to="/login">
                  <button className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all bg-emerald-600 text-white shadow-md">
                    Log In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all text-gray-600 hover:text-emerald-600">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome
              </h1>
              <h1 className="text-4xl font-bold text-emerald-600">
                back!
              </h1>
              <p className="text-gray-500 mt-3">Log in to your Jobiyo account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Email address" 
                  className="h-12 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register("email")} 
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="h-12 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    {...register("password")} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Log in as...</Label>
                <RadioGroup onValueChange={(value) => setValue('role', value, { shouldValidate: true })} className="flex gap-3">
                  <div className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'student' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <RadioGroupItem value="student" id="student" className="text-emerald-600" />
                    <Label htmlFor="student" className="cursor-pointer font-medium text-sm">Job Seeker</Label>
                  </div>
                  <div className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'recruiter' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <RadioGroupItem value="recruiter" id="recruiter" className="text-emerald-600" />
                    <Label htmlFor="recruiter" className="cursor-pointer font-medium text-sm">Recruiter</Label>
                  </div>
                  <div className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'admin' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <RadioGroupItem value="admin" id="admin" className="text-emerald-600" />
                    <Label htmlFor="admin" className="cursor-pointer font-medium text-sm">Admin</Label>
                  </div>
                </RadioGroup>
                {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={"6LfnlpUrAAAAAF0r2A5A1E4RFgQHph8dONQAVndb"}
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-900 px-4 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center w-full">
              <Button 
                type="button"
                variant="outline"
                onClick={() => loginWithGoogle()}
                className="w-full h-12 rounded-lg border-2 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-600 transition-all"
              >
                <FcGoogle className="h-6 w-6" />
                Sign in with Google
              </Button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Green Gradient with 3D Curved Illustration */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Green Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-bl from-emerald-400 via-green-500 to-emerald-600" />
          
          {/* Curved Shape Overlay - Flipped for right side */}
          <div 
            className="absolute -left-20 top-0 bottom-0 w-40 bg-white dark:bg-slate-900"
            style={{
              borderRadius: '0 100% 100% 0 / 50%',
            }}
          />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-24 h-24 bg-white/10 rounded-full blur-sm" />
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-white/10 rounded-full blur-sm" />
          <div className="absolute top-1/3 right-20 w-16 h-16 bg-yellow-400/40 rounded-full" />
          <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-emerald-300/50 rounded-full" />
          
          {/* 3D Image Container */}
          <div className="relative z-10 flex items-center justify-center w-full p-12">
            <div 
              className="relative"
              style={{
                perspective: '1000px',
              }}
            >
              {/* Main Image with 3D Transform - Flipped rotation for right side */}
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=600&fit=crop"
                alt="Professional working"
                className="rounded-3xl shadow-2xl object-cover"
                style={{
                  transform: 'rotateY(8deg) rotateX(2deg)',
                  boxShadow: '-20px 20px 60px rgba(0,0,0,0.3), 5px -5px 20px rgba(255,255,255,0.1)',
                  maxWidth: '380px',
                  height: 'auto',
                }}
              />
              
              {/* Floating Badge - Top Right */}
              <div 
                className="absolute -right-4 top-1/4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
                style={{
                  transform: 'rotateY(5deg) translateZ(30px)',
                }}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-xl">👋</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Welcome Back!</p>
                  <p className="text-xs text-gray-500">Good to see you</p>
                </div>
              </div>

              {/* Bottom Floating Badge */}
              <div 
                className="absolute -left-2 bottom-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
                style={{
                  transform: 'rotateY(5deg) translateZ(20px)',
                }}
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">🔐</span>
                </div>
                <span className="text-xs font-medium text-gray-600">Secure Login</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Verification Modal */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-center">
              We sent a verification code to <span className="font-semibold text-gray-900">{tempEmail}</span>. 
              Please enter the code below to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <Input 
                 type="text" 
                 placeholder="Enter 6-digit code" 
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 className="text-center text-2xl tracking-widest font-mono h-14 w-48"
                 maxLength={6}
            />
            {/* 
               Ideally use InputOTP component if available, but falling back to standard Input 
               styled to look like OTP input to ensure compatibility if InputOTP isn't fully set up.
               Switching to simple Input for reliability based on 'input.jsx' presence.
            */}
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleVerifyOTP} 
              disabled={isVerifying || otp.length !== 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Login
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShow2FA(false)}
              className="text-gray-500"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Expired Warning Dialog */}
      <Dialog open={showPasswordExpiredDialog} onOpenChange={setShowPasswordExpiredDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
              <AlertTriangle className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
            </div>
            <DialogTitle className="text-center text-xl">Password Expired</DialogTitle>
            <DialogDescription className="text-center">
              Your password has expired and must be changed for security reasons. 
              You cannot continue until you update your password.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-300 dark:border-yellow-800 rounded-lg p-4 my-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Why?</strong> Regular password changes help protect your account from unauthorized access.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordExpiredDialog(false);
                navigate(pendingNavigation.path);
              }}
              className="w-full sm:w-auto"
            >
              Remind Me Later
            </Button>
            <Button 
              onClick={() => {
                setShowPasswordExpiredDialog(false);
                navigate('/change-password');
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              Change Password Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;