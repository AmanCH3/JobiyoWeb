import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowRight, Clock, Briefcase, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getInitials = (name = "") => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

const RecentApplicants = ({ applicants, isLoading, isError }) => {
    return (
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 h-full">
             <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                         <CardTitle className="text-lg font-bold">Recent Applicants</CardTitle>
                         <CardDescription>Latest candidates for your roles</CardDescription>
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
                        <p>Failed to load applicants.</p>
                    </div>
                )}

                {!isLoading && !isError && applicants?.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {applicants.map((app) => (
                            <div 
                                key={app._id} 
                                className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                {/* Candidate Avatar */}
                                <Link to={`/public-profile/${app.applicant._id}`}>
                                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-slate-700">
                                        <AvatarImage src={app.applicant.profile?.avatar} />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                                            {getInitials(app.applicant.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>

                                {/* Candidate Details */}
                                <div className="flex-1 min-w-0">
                                    <Link 
                                        to={`/public-profile/${app.applicant._id}`} 
                                        className="font-semibold text-gray-900 dark:text-gray-100 hover:text-emerald-600 truncate block"
                                    >
                                        {app.applicant.fullName}
                                    </Link>
                                    
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-[200px] truncate">
                                           <Briefcase className="h-3 w-3" />
                                            Applied for <span className="font-medium text-gray-700 dark:text-gray-300">{app.job.title}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                    </div>
                                    <Link 
                                        to={`/recruiter/jobs/${app.job._id}/applicants`} 
                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1 inline-block"
                                    >
                                        View Application
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && !isError && (
                         <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">No applications received yet</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
};

export default RecentApplicants;