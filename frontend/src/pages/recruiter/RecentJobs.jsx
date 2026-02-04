import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Users, Briefcase, MapPin, Clock, Zap } from "lucide-react";
import PromoteModal from "@/components/recruiter/PromoteModal";
import { useState } from "react";
import { useGetActivePromotionsQuery } from "@/api/promotionApi";

const RecentJobs = ({ jobs, isLoading, isError }) => {
    const [promoteModalOpen, setPromoteModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const { data: activePromotions } = useGetActivePromotionsQuery();

    const handlePromoteClick = (e, job) => {
        e.preventDefault(); // Prevent Link navigation
        setSelectedJob(job);
        setPromoteModalOpen(true);
    };

    const isJobPromoted = (jobId) => {
        return activePromotions?.some(p => p.job === jobId && p.status === 'ACTIVE');
    };

    return (
        <>
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 h-full">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                                <CardTitle className="text-lg font-bold">Recent Job Postings</CardTitle>
                                <CardDescription>Your latest job listings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        </div>
                    )}
                    
                    {isError && (
                        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10">
                            <p>Failed to load jobs.</p>
                        </div>
                    )}

                    {!isLoading && !isError && jobs?.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {jobs.map((job) => {
                                const promoted = isJobPromoted(job._id);
                                return (
                                <div 
                                    key={job._id} 
                                    className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    {/* Job Icon */}
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <Briefcase className="h-5 w-5" />
                                    </div>

                                    {/* Job Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    to={`/recruiter/jobs/${job._id}/applicants`} 
                                                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-emerald-600 truncate mr-2"
                                                >
                                                    {job.title}
                                                </Link>
                                                {promoted && (
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1 px-1.5 py-0">
                                                        <Zap className="w-3 h-3 fill-amber-500 text-amber-500" /> Promoted
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-normal">
                                                    {job.jobType}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {job.applications?.length || 0} Applicants
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                        {!promoted && (
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                onClick={(e) => handlePromoteClick(e, job)}
                                            >
                                                <Zap className="w-3 h-3 mr-1" /> Promote
                                            </Button>
                                        )}
                                        <Button size="icon" variant="ghost" asChild className="h-8 w-8">
                                            <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : (
                        !isLoading && !isError && (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                    <Briefcase className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No jobs posted yet</p>
                                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                    <Link to="/recruiter/jobs/create">Post Your First Job</Link>
                                </Button>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <PromoteModal 
                isOpen={promoteModalOpen} 
                onClose={() => setPromoteModalOpen(false)}
                jobId={selectedJob?._id}
                jobTitle={selectedJob?.title}
            />
        </>
    );
};

export default RecentJobs;