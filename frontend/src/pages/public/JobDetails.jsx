import { useGetPublicJobByIdQuery } from "@/api/jobApi";
import { useApplyForJobMutation } from "@/api/applicationApi";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Loader2, 
    MapPin, 
    Briefcase, 
    CheckCircle, 
    ArrowLeft, 
    Clock, 
    DollarSign, 
    Users, 
    Calendar,
    Building2,
    Globe,
    Bookmark,
    Share2
} from "lucide-react";

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { data: job, isLoading, isError, refetch } = useGetPublicJobByIdQuery(jobId);
    const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation(); 
    
    const user = useSelector(selectCurrentUser);

    const hasApplied = job?.applications?.some(app => app.applicant === user?._id);

    // Get time ago
    const getTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const posted = new Date(date);
        const diffMs = now - posted;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Posted today';
        if (diffDays === 1) return 'Posted 1 day ago';
        if (diffDays < 7) return `Posted ${diffDays} days ago`;
        if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
        return `Posted ${Math.floor(diffDays / 30)} months ago`;
    };

    const handleApply = async () => {
        try {
            await applyForJob(jobId).unwrap();
            toast.success("Successfully applied for the job!");
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to apply for the job.");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (isLoading) return (
        <div className="flex h-screen justify-center items-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
    );
    
    if (isError || !job) return (
        <div className="flex flex-col items-center justify-center py-20">
            <p className="text-xl text-gray-600 mb-4">Job not found</p>
            <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
        </div>
    );

    const renderApplyButton = (fullWidth = false) => {
        if (!user) {
            return (
                <Button asChild className={`bg-emerald-600 hover:bg-emerald-700 ${fullWidth ? 'w-full' : ''}`}>
                    <Link to="/login">Login to Apply</Link>
                </Button>
            );
        }
        if (user.role !== 'student') {
            return <Button disabled className={fullWidth ? 'w-full' : ''}>Only Students Can Apply</Button>;
        }
        if (hasApplied) {
            return (
                <Button disabled variant="outline" className={`text-emerald-600 border-emerald-600 ${fullWidth ? 'w-full' : ''}`}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Applied
                </Button>
            );
        }
        return (
            <Button 
                onClick={handleApply} 
                disabled={isApplying}
                className={`bg-emerald-600 hover:bg-emerald-700 ${fullWidth ? 'w-full' : ''}`}
            >
                {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Now
            </Button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 border-b">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Jobs</span>
                    </button>

                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Company Logo */}
                        <div className="h-20 w-20 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                            {job.company?.logo ? (
                                <img 
                                    src={job.company.logo} 
                                    alt={job.company.name} 
                                    className="h-full w-full object-contain p-2"
                                />
                            ) : (
                                <Building2 className="h-10 w-10 text-gray-400" />
                            )}
                        </div>

                        {/* Job Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="text-sm text-gray-500">{getTimeAgo(job.createdAt)}</span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {job.jobType}
                                </Badge>
                                {job.workType && (
                                    <Badge variant="outline">{job.workType}</Badge>
                                )}
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {job.title}
                            </h1>
                            
                            <Link 
                                to={`/companies/${job.company?._id}`}
                                className="text-lg text-emerald-600 hover:underline font-medium"
                            >
                                {job.company?.name}
                            </Link>

                            {/* Quick Info */}
                            <div className="flex flex-wrap gap-4 mt-4 text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    <span>Rs. {job.salary?.toLocaleString()} LPA</span>
                                </div>
                                {job.experience && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-emerald-600" />
                                        <span>{job.experience}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 w-full lg:w-auto">
                            {renderApplyButton()}
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="flex-1 lg:flex-none">
                                    <Bookmark className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleShare} className="flex-1 lg:flex-none">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Job Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description Card */}
                        <Card className="p-6 rounded-2xl">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-emerald-600" />
                                Job Description
                            </h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {job.description}
                                </p>
                            </div>
                        </Card>

                        {/* Requirements Card */}
                        <Card className="p-6 rounded-2xl">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                Requirements
                            </h2>
                            <ul className="space-y-3">
                                {job.requirements?.map((req, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Job Overview Card */}
                        <Card className="p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Job Overview</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date Posted</p>
                                        <p className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{job.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Salary</p>
                                        <p className="font-medium">Rs. {job.salary?.toLocaleString()} LPA</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Briefcase className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Job Type</p>
                                        <p className="font-medium">{job.jobType}</p>
                                    </div>
                                </div>
                                {job.positions && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Positions</p>
                                            <p className="font-medium">{job.positions} openings</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Company Card */}
                        <Card className="p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About Company</h3>
                            <Link to={`/companies/${job.company?._id}`} className="block group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        {job.company?.logo ? (
                                            <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <Building2 className="h-7 w-7 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold group-hover:text-emerald-600 transition-colors">{job.company?.name}</h4>
                                        {job.company?.location && (
                                            <p className="text-sm text-gray-500">{job.company.location}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                            {job.company?.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                    {job.company.description}
                                </p>
                            )}
                            <Button 
                                asChild 
                                variant="outline" 
                                className="w-full"
                                disabled={!job.company?.website}
                            >
                                {job.company?.website ? (
                                    <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                                        <Globe className="h-4 w-4 mr-2" />
                                        Visit Company Website
                                    </a>
                                ) : (
                                    <span>
                                        <Globe className="h-4 w-4 mr-2" />
                                        No Website Available
                                    </span>
                                )}
                            </Button>
                        </Card>

                        {/* Apply CTA */}
                        <Card className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                            <h3 className="text-lg font-bold mb-2">Ready to Apply?</h3>
                            <p className="text-emerald-100 text-sm mb-4">Take the next step in your career journey</p>
                            {renderApplyButton(true)}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;