import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useLoginMutation } from "@/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/redux/slices/userSlice";
import { Loader2, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["student", "recruiter", "admin"], { required_error: "You must select a role." }),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const selectedRole = watch('role');

  const handleGoogleSuccess = async (response) => {
    if (!selectedRole) {
      toast.error("Please select a role before signing in with Google.");
      return;
    }

    try {
      const result = await googleAuth({ idToken: response.credential, role: selectedRole }).unwrap();
      dispatch(setCredentials(result.data));
      toast.success("Google login successful!");
      const userRole = result.data.user.role;
      const targetPath = userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/';
      navigate(targetPath);
    } catch (err) {
      toast.error(err.data?.message || "Google Authentication failed.");
    }
  };

  const onSubmit = async (data) => {
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
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
        return err.data?.message || "Login failed. Please check your credentials.";
      }
    });
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
            <div className="flex justify-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                useOneTap
                theme="outline"
                shape="circle"
                size="large"
                locale="en"
              />
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
    </div>
  );
};

export default Login;