import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeleteJobMutation } from "@/api/jobApi";
import { useToast } from "@/context/ToastContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const JobsTable = ({ jobs }) => {
    const { toast } = useToast();
    const [deleteJob, { isLoading }] = useDeleteJobMutation();

    const handleDelete = async (id) => {
        try {
            await deleteJob(id).unwrap();
            toast.success("Job deleted successfully");
        } catch (err)  {
            toast.error(err.data?.message || "Failed to delete job");
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Posted On</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs.map((job) => (
                    <TableRow key={job._id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <img src={job.company.logo || '/placeholder-logo.png'} alt={job.company.name} className="h-6 w-6 rounded-full object-cover" />
                                {job.company.name}
                            </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{job.jobType}</Badge></TableCell>
                        <TableCell>{format(new Date(job.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{job.applications?.length || 0}</TableCell>
                        <TableCell className="text-right">
                             <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild><Link to={`/recruiter/jobs/edit/${job._id}`} className="cursor-pointer flex items-center"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link to={`/recruiter/jobs/${job._id}/applicants`} className="cursor-pointer flex items-center"><Users className="mr-2 h-4 w-4"/>View Applicants</Link></DropdownMenuItem>
                                        <AlertDialogTrigger asChild><DropdownMenuItem className="cursor-pointer flex items-center text-destructive"><Trash className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete this job posting.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(job._id)} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                                            {isLoading ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default JobsTable;