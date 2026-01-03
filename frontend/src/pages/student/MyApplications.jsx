import { useGetMyApplicationsQuery } from "@/api/applicationApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const StatusBadge = ({ status }) => {
    const variant = {
        pending: "default",
        accepted: "success",
        rejected: "destructive",
    }[status];
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
};

const MyApplications = () => {
    const { data: applications, isLoading, isError, error } = useGetMyApplicationsQuery();

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>My Job Applications</CardTitle>
                    <CardDescription>Track the status of your applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {isError && <p className="text-destructive">Error: {error?.data?.message || "Failed to load applications"}</p>}
                    
                    {applications && applications.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Date Applied</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app._id}>
                                        <TableCell className="font-medium">
                                            <Link to={`/jobs/${app.job._id}`} className="hover:underline text-primary">
                                                {app.job.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{app.job.company.name}</TableCell>
                                        <TableCell>{format(new Date(app.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right"><StatusBadge status={app.status} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {applications && applications.length === 0 && !isLoading && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                            <Button asChild variant="link" className="mt-2">
                                <Link to="/jobs">Browse Jobs</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyApplications;