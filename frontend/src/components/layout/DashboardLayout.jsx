import { useState } from "react";
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
    Menu,
    X,
    ChevronRight,
    Search,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logOut, selectCurrentUser } from "@/redux/slices/userSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SidebarData = {
    recruiter: [
        { title: "Dashboard", path: "/recruiter", icon: <LayoutDashboard className="w-5 h-5" /> },
        { title: "My Companies", path: "/recruiter/companies", icon: <Building2 className="w-5 h-5" /> },
        { title: "Job Postings", path: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
        { title: "Conversations", path: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
        { title: "Interviews", path: "/my-interviews", icon: <Calendar className="w-5 h-5" /> },
    ],
    admin: [
        { title: "Company Verification", path: "/admin", icon: <ShieldCheck className="w-5 h-5" /> },
        { title: "User Management", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { title: "Chatbot Settings", path: "/admin/chatbot", icon: <Bot className="w-5 h-5" /> },
        { title: "System Logs", path: "/admin/logs", icon: <ScrollText className="w-5 h-5" /> },
    ]
};

const DashboardLayout = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logOut());
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-slate-800">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <span className="font-bold text-lg">J</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        Jobiyo
                    </span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Menu
                </div>
                {user?.role && SidebarData[user.role]?.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        end
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                            isActive 
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-sm" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                        )}
                    >
                        {item.icon}
                        <span>{item.title}</span>
                        {/* Active Indicator Line */}
                        <div className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-emerald-600 transition-all duration-300 opacity-0",
                           // isActive ? "opacity-100" : "opacity-0" // Optional: visual preference
                        )} />
                    </NavLink>
                ))}
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm mb-3">
                    <img 
                        src={user?.profile?.avatar || '/placeholder.gif'} 
                        alt="user" 
                        className="h-10 w-10 rounded-lg object-cover ring-2 ring-white dark:ring-slate-700" 
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                            {user?.role}
                        </p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-9"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={toggleMobileMenu}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                        <button 
                            onClick={toggleMobileMenu}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                "md:pl-72" // Make space for sidebar on desktop
            )}>
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="-ml-2">
                            <Menu className="w-6 h-6 text-gray-600" />
                        </Button>
                        <Link to="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            Jobiyo
                        </Link>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                        <img src={user?.profile?.avatar || '/placeholder.gif'} alt="user" className="h-full w-full object-cover" />
                    </div>
                </div>

                {/* Dashboard Content Container */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {/* Optional: Add a subtle graphic or gradient blob in the background */}
                    <div className="fixed top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
                        <div className="h-[500px] w-[500px] rounded-full bg-emerald-600 blur-[100px]" />
                    </div>
                    
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;