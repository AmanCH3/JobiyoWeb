import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegisterMutation } from "@/api/authApi";
import { Loader2, ArrowLeft } from "lucide-react";
import Lottie from "lottie-react";
import authAnimation from "@/lottie/login_screen.json";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react"; 
import PasswordStrengthMeter from "@/components/shared/PasswordStrengthMeter";

const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["student", "recruiter"], { required_error: "You must select a role." }),
});

const Register = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null); // State to hold the token

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(registerSchema),
  });
  
  const password = watch('password', ''); 

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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
           <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16}/> Back to Home
          </Link>
          <div className="grid gap-2 text-left">
            <h1 className="text-3xl font-bold font-philosopher">Create an Account</h1>
            <p className="text-muted-foreground">Join Jobiyo to find your next opportunity.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" placeholder="98XXXXXXXX" {...register("phoneNumber")} />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              <PasswordStrengthMeter password={password} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label>I am a...</Label>
              <RadioGroup onValueChange={(value) => setValue('role', value)} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Job Seeker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recruiter" id="recruiter" />
                  <Label htmlFor="recruiter">Recruiter</Label>
                </div>
              </RadioGroup>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={"6LfnlpUrAAAAAF0r2A5A1E4RFgQHph8dONQAVndb"}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center">
         <Lottie animationData={authAnimation} loop={true} style={{ maxWidth: '80%' }}/>
      </div>
    </div>
  );
};

export default Register;