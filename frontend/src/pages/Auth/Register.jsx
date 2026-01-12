import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';
import { useRegisterMutation, useGoogleAuthMutation } from "@/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/userSlice";
import { Loader2, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react"; 
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";

const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character." }),
  role: z.enum(["student", "recruiter"], { required_error: "You must select a role." }),
}).refine((data) => {
  if (data.fullName && data.password) {
      const nameParts = data.fullName.split(/[\s-]+/).filter(part => part.length >= 3);
      for (const part of nameParts) {
          if (data.password.toLowerCase().includes(part.toLowerCase())) {
              return false;
          }
      }
  }
  return true;
}, {
  message: "Password cannot contain parts of your name.",
  path: ["password"],
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const selectedRole = watch('role');

  const handleGoogleSuccess = async (response) => {
    if (!selectedRole) {
      toast.error("Please select a role before signing up with Google.");
      return;
    }

    try {
      const result = await googleAuth({ idToken: response.credential, role: selectedRole }).unwrap();
      dispatch(setCredentials(result.data));
      toast.success("Google registration successful!");
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

    try {
      const result = await registerUser({ ...data, recaptchaToken }).unwrap();
      toast.success(result.message || "Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.data?.message || "Registration failed. Please try again.");
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Full Width Navbar with White Background */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-4 px-6 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Jobiyo" className="h-9 w-9" />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Jobiyo
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
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
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Green Gradient with 3D Curved Illustration */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Green Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600" />
          
          {/* Curved Shape Overlay */}
          <div 
            className="absolute -right-20 top-0 bottom-0 w-40 bg-white dark:bg-slate-900"
            style={{
              borderRadius: '100% 0 0 100% / 50%',
            }}
          />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-sm" />
          <div className="absolute bottom-32 right-32 w-40 h-40 bg-white/10 rounded-full blur-sm" />
          <div className="absolute top-1/3 left-20 w-16 h-16 bg-yellow-400/40 rounded-full" />
          <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-emerald-300/50 rounded-full" />
          
          {/* 3D Image Container */}
          <div className="relative z-10 flex items-center justify-center w-full p-12">
            <div 
              className="relative"
              style={{
                perspective: '1000px',
              }}
            >
              {/* Main Image with 3D Transform */}
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=600&fit=crop"
                alt="Professional team collaboration"
                className="rounded-3xl shadow-2xl object-cover"
                style={{
                  transform: 'rotateY(-8deg) rotateX(2deg)',
                  boxShadow: '20px 20px 60px rgba(0,0,0,0.3), -5px -5px 20px rgba(255,255,255,0.1)',
                  maxWidth: '380px',
                  height: 'auto',
                }}
              />
              
              {/* Floating Badge */}
              <div 
                className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
                style={{
                  transform: 'rotateY(-5deg) translateZ(30px)',
                }}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-xl">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">50,000+</p>
                  <p className="text-xs text-gray-500">Happy Users</p>
                </div>
              </div>

              {/* Bottom Floating Badge */}
              <div 
                className="absolute -right-2 bottom-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
                style={{
                  transform: 'rotateY(-5deg) translateZ(20px)',
                }}
              >
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 border-2 border-white" />
                  <div className="h-8 w-8 rounded-full bg-blue-500 border-2 border-white" />
                  <div className="h-8 w-8 rounded-full bg-purple-500 border-2 border-white" />
                </div>
                <span className="text-xs font-medium text-gray-600">Join Now!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Toggle Button */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-full p-1">
                <Link to="/login">
                  <button className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all text-gray-600 hover:text-emerald-600">
                    Log In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all bg-emerald-600 text-white shadow-md">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Create
              </h1>
              <h1 className="text-4xl font-bold text-emerald-600">
                account
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  id="fullName" 
                  placeholder="Full Name" 
                  className="h-12 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register("fullName")} 
                />
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
              </div>

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
                <Input 
                  id="phoneNumber" 
                  placeholder="Phone Number" 
                  className="h-12 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register("phoneNumber")} 
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
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
                <PasswordStrengthMeter password={password} />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 dark:text-gray-400">I am a...</Label>
                <RadioGroup onValueChange={(value) => setValue('role', value)} className="flex gap-4">
                  <div className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'student' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <RadioGroupItem value="student" id="student" className="text-emerald-600" />
                    <Label htmlFor="student" className="cursor-pointer font-medium">Job Seeker</Label>
                  </div>
                  <div className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'recruiter' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <RadioGroupItem value="recruiter" id="recruiter" className="text-emerald-600" />
                    <Label htmlFor="recruiter" className="cursor-pointer font-medium">Recruiter</Label>
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
                Create account
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-900 px-4 text-gray-500">or sign up with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Registration Failed")}
                theme="outline"
                shape="circle"
                size="large"
                locale="en"
              />
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By creating an account you agree to Jobiyo's{" "}
              <Link to="/terms" className="text-emerald-600 hover:underline">Terms of Services</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
            </p>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Have an account?{" "}
              <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;