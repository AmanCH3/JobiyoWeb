import { useGetJobApplicantsQuery } from "@/api/applicationApi";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ApplicantsTable from "@/pages/recruiter/ApplicantsTable";

const Applicants = () => {
    const { jobId } = useParams();
    const { data: applicants, isLoading, isError, error } = useGetJobApplicantsQuery(jobId);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Applicants</CardTitle>
                <CardDescription>Review the candidates who have applied for this position.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {isError && <p className="text-destructive">Error: {error?.data?.message || "Failed to load applicants"}</p>}
                
                {applicants && applicants.length > 0 && <ApplicantsTable applicants={applicants} />}
                {applicants && applicants.length === 0 && !isLoading && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No one has applied for this job yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Applicants;