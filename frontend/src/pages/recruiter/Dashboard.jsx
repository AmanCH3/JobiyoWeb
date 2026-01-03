import { useGetStatsQuery, useGetRecentApplicantsQuery } from "@/api/recruiterDashboardApi";
import { useGetMyPostedJobsQuery } from "@/api/jobApi"; 
import { Building2, Briefcase, Users, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import RecentApplicants from "./RecentApplicants";
import RecentJobs from "./RecentJobs";

const StatCard = ({ title, value, icon, isLoading }) => (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            {icon}
        </div>
        <div className="mt-2">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <p className="text-3xl font-bold">{value ?? '0'}</p>}
        </div>
    </div>
);

const RecruiterDashboard = () => {
  const user = useSelector(selectCurrentUser);
  
  const { data: stats, isLoading: isLoadingStats } = useGetStatsQuery();
  const { data: recentApplicants, isLoading: isLoadingApplicants, isError: isErrorApplicants } = useGetRecentApplicantsQuery();
  const { data: myJobs, isLoading: isLoadingJobs, isError: isErrorJobs } = useGetMyPostedJobsQuery();

  const recentJobs = myJobs?.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName}!</h1>
      <p className="text-muted-foreground">Here's a summary of your activities on Jobiyo.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Companies" value={stats?.totalCompanies} icon={<Building2 className="h-5 w-5 text-muted-foreground"/>} isLoading={isLoadingStats} />
        <StatCard title="Total Jobs Posted" value={stats?.totalJobs} icon={<Briefcase className="h-5 w-5 text-muted-foreground"/>} isLoading={isLoadingStats} />
        <StatCard title="Total Applicants" value={stats?.totalApplicants} icon={<Users className="h-5 w-5 text-muted-foreground"/>} isLoading={isLoadingStats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <RecentApplicants 
            applicants={recentApplicants}
            isLoading={isLoadingApplicants}
            isError={isErrorApplicants}
        />
        <RecentJobs 
            jobs={recentJobs}
            isLoading={isLoadingJobs}
            isError={isErrorJobs}
        />
      </div>
    </div>
  );
};

export default RecruiterDashboard;