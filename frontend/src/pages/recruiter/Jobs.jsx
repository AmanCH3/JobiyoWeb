import { useGetMyPostedJobsQuery } from "@/api/jobApi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PlusCircle, Loader2 } from "lucide-react";
import JobsTable from "@/pages/recruiter/JobsTable";

const Jobs = () => {
    const { data: jobs, isLoading, isError, error } = useGetMyPostedJobsQuery();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Job Postings</CardTitle>
                    <CardDescription>Manage your posted jobs and view applicants.</CardDescription>
                </div>
                <Button asChild>
                    <Link to="/recruiter/jobs/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {isError && <p className="text-destructive">Error: {error?.data?.message || "Failed to load jobs"}</p>}
                {jobs && <JobsTable jobs={jobs} />}
            </CardContent>
        </Card>
    );
}

export default Jobs;