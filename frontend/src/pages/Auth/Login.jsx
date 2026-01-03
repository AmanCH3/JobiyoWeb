import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "@/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/userSlice";
import { Loader2, ArrowLeft } from "lucide-react";
import Lottie from "lottie-react";
import authAnimation from "@/lottie/login_screen.json";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react"; 

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["student", "recruiter", "admin"], { required_error: "You must select a role." }),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginMutation();
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null); 

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const selectedRole = watch('role');

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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 relative">
        <div className="absolute top-8 left-8">
            <Button variant="ghost" asChild>
                <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={16}/> Back to Home
                </Link>
            </Button>
        </div>
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-left">
            <h1 className="text-3xl font-bold font-philosopher">Welcome Back!</h1>
            <p className="text-muted-foreground">Log in to your Jobiyo account to continue.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                        Forgot password?
                    </Link>
                </div>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label>Log in as...</Label>
              <RadioGroup onValueChange={(value) => setValue('role', value, { shouldValidate: true })} className="flex flex-wrap gap-4 pt-2">
                <Label htmlFor="student" className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-all ${selectedRole === 'student' ? 'border-primary ring-2 ring-primary/50' : ''}`}>
                  <RadioGroupItem value="student" id="student" />
                  <span>Job Seeker</span>
                </Label>
                <Label htmlFor="recruiter" className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-all ${selectedRole === 'recruiter' ? 'border-primary ring-2 ring-primary/50' : ''}`}>
                  <RadioGroupItem value="recruiter" id="recruiter" />
                  <span>Recruiter</span>
                </Label>
                 <Label htmlFor="admin" className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-all ${selectedRole === 'admin' ? 'border-primary ring-2 ring-primary/50' : ''}`}>
                  <RadioGroupItem value="admin" id="admin" />
                  <span>Admin</span>
                </Label>
              </RadioGroup>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={"6LfnlpUrAAAAAF0r2A5A1E4RFgQHph8dONQAVndb"}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-10">
        <Lottie animationData={authAnimation} loop={true} style={{ maxWidth: '80%' }}/>
      </div>
    </div>
  );
};

export default Login;