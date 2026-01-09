import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { 
    Building2, 
    Briefcase, 
    LayoutDashboard, 
    LogOut, 
    ShieldCheck, 
    Users, 
    MessageSquare,
    Calendar,
    Bot,
    ScrollText, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logOut, selectCurrentUser } from "@/redux/slices/userSlice";
import { toast } from "sonner";

const SidebarLink = ({ to, icon, children }) => (
 <NavLink
   to={to}
   end
   className={({ isActive }) =>
     `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
       isActive && "bg-muted text-primary font-semibold"
     }`
   }
 >
   {icon}
   {children}
 </NavLink>
);

const DashboardLayout = () => {
 const user = useSelector(selectCurrentUser);
 const dispatch = useDispatch();
 const navigate = useNavigate();

 const handleLogout = () => {
   dispatch(logOut());
   toast.success("Logged out successfully.");
   navigate("/login");
 };

 return (
   <div className="flex h-screen w-full">
     <div className="hidden w-[220px] flex-col border-r bg-muted/40 md:flex lg:w-[280px]">
       <div className="flex h-full max-h-screen flex-col gap-2">
         <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
           <Link to="/" className="flex items-center gap-2 font-semibold">
             <span className="font-philosopher text-xl">Jobiyo</span>
           </Link>
         </div>
         <div className="flex-1 overflow-y-auto">
           <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
             {user?.role === 'recruiter' && (
               <>
                 <SidebarLink to="/recruiter" icon={<LayoutDashboard className="h-4 w-4" />}>
                   Dashboard
                 </SidebarLink>
                 <SidebarLink to="/recruiter/companies" icon={<Building2 className="h-4 w-4" />}>
                   My Companies
                 </SidebarLink>
                 <SidebarLink to="/recruiter/jobs" icon={<Briefcase className="h-4 w-4" />}>
                   Job Postings
                 </SidebarLink>
                 <SidebarLink to="/chat" icon={<MessageSquare className="h-4 w-4" />}>
                    Conversations
                 </SidebarLink>
                 <SidebarLink to="/my-interviews" icon={<Calendar className="h-4 w-4" />}>
                    Interview Calendar
                 </SidebarLink>
               </>
             )}
             {user?.role === 'admin' && (
               <>
                 <SidebarLink to="/admin" icon={<ShieldCheck className="h-4 w-4" />}>
                   Company Verification
                 </SidebarLink>
                 <SidebarLink to="/admin/users" icon={<Users className="h-4 w-4" />}>
                   User Management
                 </SidebarLink>
                 <SidebarLink to="/admin/chatbot" icon={<Bot className="h-4 w-4" />}>
                   Chatbot Settings
                 </SidebarLink>
                 <SidebarLink to="/admin/logs" icon={<ScrollText className="h-4 w-4" />}>
                   System Logs
                 </SidebarLink>
               </>
             )}
           </nav>
         </div>
         <div className="mt-auto p-4 border-t">
           <div className="flex items-center gap-3 mb-4">
               <img src={user?.profile?.avatar || '/placeholder.gif'} alt="user" className="h-10 w-10 rounded-full object-cover" />
               <div className="flex flex-col overflow-hidden">
                   <span className="font-semibold text-sm truncate">{user?.fullName}</span>
                   <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
               </div>
           </div>
           <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary" onClick={handleLogout}>
               <LogOut className="h-4 w-4" /> Logout
           </Button>
         </div>
       </div>
     </div>
     <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-y-auto">
       <Outlet />
     </main>
   </div>
 );
};

export default DashboardLayout;