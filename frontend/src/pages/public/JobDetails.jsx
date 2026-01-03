import { useGetPublicJobByIdQuery } from "@/api/jobApi"; // This one is correct
import { useApplyForJobMutation } from "@/api/applicationApi"; // CORRECTED: Import from applicationApi
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Briefcase, CheckCircle } from "lucide-react";

const JobDetails = () => {
    const { jobId } = useParams();
    const { data: job, isLoading, isError, refetch } = useGetPublicJobByIdQuery(jobId);
    const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation(); 
    
    const user = useSelector(selectCurrentUser);

    const hasApplied = job?.applications?.some(app => app.applicant === user?._id);

    const handleApply = async () => {
        try {
            await applyForJob(jobId).unwrap();
            toast.success("Successfully applied for the job!");
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to apply for the job.");
        }
    };

    if (isLoading) return <div className="flex h-screen justify-center items-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    if (isError || !job) return <p className="text-center text-destructive py-10">Job not found.</p>;

    const renderApplyButton = () => {
        if (!user) {
            return <Button asChild><Link to="/login">Login to Apply</Link></Button>;
        }
        if (user.role !== 'student') {
            return <Button disabled>Only Students Can Apply</Button>;
        }
        if (hasApplied) {
            return <Button disabled variant="outline" className="text-green-600 border-green-600"><CheckCircle className="mr-2 h-4 w-4" /> Applied</Button>;
        }
        return (
            <Button onClick={handleApply} disabled={isApplying}>
                {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Now
            </Button>
        );
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{job.title}</h1>
                            <p className="text-lg text-muted-foreground">{job.company.name}</p>
                        </div>
                        <img src={job.company.logo || '/placeholder-logo.png'} alt={job.company.name} className="h-16 w-16 rounded-lg object-cover hidden md:block" />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</div>
                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.jobType}</div>
                        <div className="flex items-center gap-2">Rs. {job.salary.toLocaleString()} LPA</div>
                    </div>
                    <div className="mt-8 prose-sm md:prose max-w-none text-gray-700">
                        <h3 className="font-semibold text-lg text-gray-900">Job Description</h3>
                        <p className="whitespace-pre-wrap">{job.description}</p>
                        <h3 className="font-semibold text-lg text-gray-900 mt-6">Requirements</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {job.requirements.map((req, index) => <li key={index}>{req}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
             <div className="mt-8 border-t pt-6 text-center">
                {renderApplyButton()}
            </div>
        </div>
    );
};

export default JobDetails;