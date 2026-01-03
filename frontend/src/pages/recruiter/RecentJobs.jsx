import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Users } from "lucide-react";

const RecentJobs = ({ jobs, isLoading, isError }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Your most recently added job listings.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {isError && <p className="text-destructive text-center p-4">Could not load jobs.</p>}
                {!isLoading && !isError && jobs?.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Applicants</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job._id}>
                                    <TableCell>
                                        <Link to={`/recruiter/jobs/${job._id}/applicants`} className="font-medium hover:underline">
                                            {job.title}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{job.company.name}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{job.jobType}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            {job.applications?.length || 0}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                 {!isLoading && !isError && jobs?.length === 0 && (
                    <div className="text-center text-muted-foreground p-10">
                        You haven't posted any jobs yet.
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                    <Link to="/recruiter/jobs">Manage All Jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecentJobs;