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
import { LogOut, User, Settings, LayoutDashboard, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";
import ChatNotification from "./ChatNotification";

const Navbar = () => {
 const user = useSelector(selectCurrentUser);
 const dispatch = useDispatch();
 const navigate = useNavigate();

 const handleLogout = () => {
   dispatch(logOut());
   toast.success("Logged out successfully.");
   navigate("/login");
 };

 const getInitials = (name = "") => {
   return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
 }

 return (
   <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
     <div className="container flex h-16 items-center">
       <Link to="/" className="mr-6 flex items-center space-x-2">
         <span className="font-philosopher text-2xl font-bold">Jobiyo</span>
       </Link>
       <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
         <Link to="/" className="text-foreground/60 transition-colors hover:text-foreground/80">Home</Link>
         <Link to="/jobs" className="text-foreground/60 transition-colors hover:text-foreground/80">Find Jobs</Link>
         <Link to="/companies" className="text-foreground/60 transition-colors hover:text-foreground/80">Companies</Link>
       </nav>
       <div className="flex flex-1 items-center justify-end space-x-2"> 
         {user ? (
           <>

             {(user.role === 'student' || user.role === 'recruiter') && <ChatNotification />}

             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-9 w-9">
                     <AvatarImage src={user.profile?.avatar} alt={user.fullName} />
                     <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
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
             <Button asChild variant="ghost">
               <Link to="/login">Log In</Link>
             </Button>
             <Button asChild>
               <Link to="/register">Sign Up</Link>
             </Button>
           </nav>
         )}
       </div>
     </div>
   </header>
 );
};

export default Navbar;