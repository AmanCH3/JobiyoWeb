import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getInitials = (name = "") => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

const RecentApplicants = ({ applicants, isLoading, isError }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Applicants</CardTitle>
                <CardDescription>The latest candidates who applied to your jobs.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {isError && <p className="text-destructive text-center p-4">Could not load applicants.</p>}
                {!isLoading && !isError && applicants?.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Applied For</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applicants.map((app) => (
                                <TableRow key={app._id}>
                                    <TableCell>
                                        <Link to={`/public-profile/${app.applicant._id}`} className="flex items-center gap-3 hover:underline">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={app.applicant.profile?.avatar} />
                                                <AvatarFallback>{getInitials(app.applicant.fullName)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{app.applicant.fullName}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/recruiter/jobs/${app.job._id}/applicants`} className="text-muted-foreground hover:underline">
                                            {app.job.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                 {!isLoading && !isError && applicants?.length === 0 && (
                    <div className="text-center text-muted-foreground p-10">
                        No recent applications found.
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button asChild variant="secondary" className="w-full">
                    <Link to="/recruiter/jobs">View All Jobs & Applicants <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecentApplicants;