import { useGetStatsQuery, useGetRecentApplicantsQuery } from "@/api/recruiterDashboardApi";
import { useGetMyPostedJobsQuery } from "@/api/jobApi"; 
import { Building2, Briefcase, Users, Loader2, Plus, ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import RecentApplicants from "./RecentApplicants";
import RecentJobs from "./RecentJobs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const StatCard = ({ title, value, icon, isLoading, colorClass }) => (
    <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-slate-900 group">
        <div className="flex items-start justify-between">
            <div>
                <p className="font-medium text-sm text-muted-foreground mb-1">{title}</p>
                {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50"/>
                ) : (
                    <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {value ?? '0'}
                    </h3>
                )}
            </div>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
    </Card>
);

const RecruiterDashboard = () => {
    const user = useSelector(selectCurrentUser);
  
    const { data: stats, isLoading: isLoadingStats } = useGetStatsQuery();
    const { data: recentApplicants, isLoading: isLoadingApplicants, isError: isErrorApplicants } = useGetRecentApplicantsQuery();
    const { data: myJobs, isLoading: isLoadingJobs, isError: isErrorJobs } = useGetMyPostedJobsQuery();

    const recentJobs = myJobs?.slice(0, 5);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's what's happening with your jobs today.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                        <Link to="/recruiter/jobs/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Post a New Job
                        </Link>
                    </Button>
                </div>
            </div>
      
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Active Jobs" 
                    value={stats?.totalJobs} 
                    icon={<Briefcase className="h-6 w-6 text-emerald-600" />} 
                    colorClass="bg-emerald-500"
                    isLoading={isLoadingStats} 
                />
                <StatCard 
                    title="Total Applicants" 
                    value={stats?.totalApplicants} 
                    icon={<Users className="h-6 w-6 text-blue-600" />} 
                    colorClass="bg-blue-500"
                    isLoading={isLoadingStats} 
                />
                <StatCard 
                    title="Companies Managed" 
                    value={stats?.totalCompanies} 
                    icon={<Building2 className="h-6 w-6 text-purple-600" />} 
                    colorClass="bg-purple-500"
                    isLoading={isLoadingStats} 
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Applicants - Takes up 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">Recent Applicants</h2>
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-emerald-600">
                            <Link to="/recruiter/applicants" className="flex items-center gap-1">
                                View All <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <RecentApplicants 
                        applicants={recentApplicants}
                        isLoading={isLoadingApplicants}
                        isError={isErrorApplicants}
                    />
                </div>

                {/* Recent Jobs - Takes up 1 column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">Recent Jobs</h2>
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-emerald-600">
                            <Link to="/recruiter/jobs" className="flex items-center gap-1">
                                View All <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <RecentJobs 
                        jobs={recentJobs}
                        isLoading={isLoadingJobs}
                        isError={isErrorJobs}
                    />
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;