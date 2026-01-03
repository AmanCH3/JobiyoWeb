import { useGetPublicJobsQuery } from "@/api/jobApi";
import { Loader2, Briefcase } from "lucide-react";
import JobCard from "@/pages/public/JobCard";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const FeaturedJobs = () => {
    const { data: jobs, isLoading, isError } = useGetPublicJobsQuery(undefined, {
        selectFromResult: ({ data, ...rest }) => ({
            data: data?.jobs?.slice(0, 6), 
            ...rest
        }),
    });

    return (
        <section className="py-12 md:py-20">
            <div className="container mx-auto">
                 <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Latest Job Openings
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Here are some of the most recent jobs posted on our platform. Your next career move could be here.
                    </p>
                </div>

                {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                
                {isError && (
                     <div className="text-center text-destructive">
                        <p>Could not load jobs at this time.</p>
                    </div>
                )}
                
                {jobs && jobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => <JobCard key={job._id} job={job} />)}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Button asChild>
                        <Link to="/jobs">
                            <Briefcase className="mr-2 h-4 w-4"/>
                            Browse All Jobs
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedJobs;