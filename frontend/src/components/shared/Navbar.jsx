import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logOut } from "@/redux/slices/userSlice";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, LayoutDashboard, Briefcase, Calendar, Menu, X } from "lucide-react";
import { toast } from "sonner";
import ChatNotification from "./ChatNotification";
import { cn } from "@/lib/utils";

const Navbar = () => {
 const user = useSelector(selectCurrentUser);
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const [isScrolled, setIsScrolled] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 useEffect(() => {
   const handleScroll = () => {
     setIsScrolled(window.scrollY > 50);
   };

   window.addEventListener("scroll", handleScroll);
   return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 const handleLogout = () => {
   dispatch(logOut());
   toast.success("Logged out successfully.");
   navigate("/login");
 };

 const getInitials = (name = "") => {
   return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
 }

 return (
   <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3 transition-all duration-300">
     <div
       className={cn(
         "flex items-center justify-between transition-all duration-500 ease-out",
         isScrolled
           ? "container max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg border border-white/20 rounded-full px-6 py-2"
           : "container bg-transparent py-2"
       )}
     >
       {/* Logo */}
       <Link to="/" className="flex items-center space-x-2 group">
         {/* Logo Icon */}
         <img 
           src="/logo.png" 
           alt="Jobiyo Logo" 
           className={cn(
             "transition-all duration-300 object-contain",
             isScrolled ? "h-8 w-8" : "h-10 w-10"
           )}
         />
         <span className={cn(
           "font-bold tracking-tight transition-all duration-300",
           isScrolled ? "text-lg" : "text-xl",
           "bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent"
         )}>
           Jobiyo
         </span>
       </Link>

       {/* Desktop Navigation */}
       <nav className={cn(
         "hidden md:flex items-center transition-all duration-300",
         isScrolled ? "space-x-4" : "space-x-6"
       )}>
         <Link 
           to="/" 
           className={cn(
             "relative font-medium transition-colors hover:text-emerald-600 group",
             isScrolled ? "text-sm text-foreground/80" : "text-sm text-foreground/70"
           )}
         >
           Home
           <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
         </Link>
         <Link 
           to="/jobs" 
           className={cn(
             "relative font-medium transition-colors hover:text-emerald-600 group",
             isScrolled ? "text-sm text-foreground/80" : "text-sm text-foreground/70"
           )}
         >
           Find Jobs
           <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
         </Link>
         <Link 
           to="/companies" 
           className={cn(
             "relative font-medium transition-colors hover:text-emerald-600 group",
             isScrolled ? "text-sm text-foreground/80" : "text-sm text-foreground/70"
           )}
         >
           Companies
           <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
         </Link>
       </nav>

       {/* Right Section */}
       <div className="flex items-center space-x-2"> 
         {user ? (
           <>
             {(user.role === 'student' || user.role === 'recruiter') && <ChatNotification />}

             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className={cn(
                   "relative rounded-full transition-all duration-300",
                   isScrolled ? "h-8 w-8" : "h-9 w-9"
                 )}>
                   <Avatar className={cn(
                     "transition-all duration-300",
                     isScrolled ? "h-8 w-8" : "h-9 w-9"
                   )}>
                     <AvatarImage src={user.profile?.avatar} alt={user.fullName} />
                     <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                       {getInitials(user.fullName)}
                     </AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-56" align="end" forceMount>
                 <DropdownMenuLabel className="font-normal">
                   <div className="flex flex-col space-y-1">
                     <p className="text-sm font-medium leading-none">{user.fullName}</p>
                     <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                   </div>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 
                 {user.role === 'student' && (
                   <>
                     <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                       <User className="mr-2 h-4 w-4" />
                       <span>My Profile</span>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => navigate('/student/applications')}>
                       <Briefcase className="mr-2 h-4 w-4" />
                       <span>My Applications</span>
                     </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/my-interviews')}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>My Interviews</span>
                      </DropdownMenuItem>
                   </>
                 )}

                 {user.role === 'recruiter' && (
                    <DropdownMenuItem onClick={() => navigate('/recruiter')}>
                       <LayoutDashboard className="mr-2 h-4 w-4" />
                       <span>Dashboard</span>
                    </DropdownMenuItem>
                 )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                       <LayoutDashboard className="mr-2 h-4 w-4" />
                       <span>Admin Panel</span>
                    </DropdownMenuItem>
                 )}

                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                   <span>Log out</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </>
         ) : (
           <nav className="flex items-center space-x-2">
             <Button 
               asChild 
               variant="ghost" 
               size={isScrolled ? "sm" : "default"}
               className="font-medium"
             >
               <Link to="/login">Log In</Link>
             </Button>
             <Button 
               asChild 
               size={isScrolled ? "sm" : "default"}
               className={cn(
                 "font-medium transition-all duration-300",
                 isScrolled ? "rounded-full px-4" : "rounded-lg"
               )}
             >
               <Link to="/register">Sign Up</Link>
             </Button>
           </nav>
         )}

         {/* Mobile Menu Button */}
         <Button 
           variant="ghost" 
           size="icon" 
           className="md:hidden"
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
         >
           {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
         </Button>
       </div>
     </div>

     {/* Mobile Menu */}
     {isMobileMenuOpen && (
       <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border p-4 md:hidden">
         <nav className="flex flex-col space-y-3">
           <Link 
             to="/" 
             className="font-medium text-foreground/80 hover:text-primary py-2"
             onClick={() => setIsMobileMenuOpen(false)}
           >
             Home
           </Link>
           <Link 
             to="/jobs" 
             className="font-medium text-foreground/80 hover:text-primary py-2"
             onClick={() => setIsMobileMenuOpen(false)}
           >
             Find Jobs
           </Link>
           <Link 
             to="/companies" 
             className="font-medium text-foreground/80 hover:text-primary py-2"
             onClick={() => setIsMobileMenuOpen(false)}
           >
             Companies
           </Link>
         </nav>
       </div>
     )}
   </header>
 );
};

export default Navbar;