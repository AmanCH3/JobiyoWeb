import { useUpdateApplicationStatusMutation } from "@/api/applicationApi";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle, XCircle, FileText, Loader2, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import ScheduleInterviewForm from "@/components/recruiter/ScheduleInterviewForm";

const StatusBadge = ({ status }) => {
    const variant = {
        pending: "default",
        accepted: "success",
        rejected: "destructive",
    }[status];
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
};

const ApplicantsTable = ({ applicants }) => {
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateApplicationStatusMutation();
    const navigate = useNavigate();

    const [isScheduling, setIsScheduling] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const handleStatusUpdate = async (applicationId, status) => {
        const promise = updateStatus({ applicationId, status }).unwrap();
        toast.promise(promise, {
            loading: 'Updating status...',
            success: 'Status updated successfully!',
            error: (err) => err?.data?.message || 'Failed to update status.',
        });
    };

    const openScheduleDialog = (application) => {
        setSelectedApplication(application);
        setIsScheduling(true);
    };

    const handleStartChat = (applicantId) => {
        navigate('/chat', { state: { userIdToChat: applicantId } });
    };

    return (
        <>
            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                        {selectedApplication && (
                             <p className="text-sm text-muted-foreground">For applicant: {selectedApplication.applicant.fullName}</p>
                        )}
                    </DialogHeader>
                    {selectedApplication && (
                        <ScheduleInterviewForm
                            applicationId={selectedApplication._id}
                            closeDialog={() => setIsScheduling(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants.map((app) => (
                        <TableRow key={app._id}>
                            <TableCell className="font-medium">
                                <Link to={`/public-profile/${app.applicant._id}`} className="hover:underline text-primary flex items-center gap-3">
                                    <img src={app.applicant.profile?.avatar || '/placeholder.gif'} alt={app.applicant.fullName} className="h-10 w-10 rounded-full object-cover"/>
                                    <div>
                                        <p>{app.applicant.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{app.applicant.email}</p>
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell className="max-w-xs">
                                {app.applicant.profile?.skills?.length > 0 ? (
                                    app.applicant.profile.skills.slice(0, 3).map(skill => (
                                        <Badge key={skill} variant="secondary" className="mr-1 mb-1">{skill}</Badge>
                                    ))
                                ) : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell>{format(new Date(app.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell><StatusBadge status={app.status} /></TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {app.applicant.profile?.resume ? (
                                            <DropdownMenuItem asChild>
                                                <a href={`http://localhost:8000${app.applicant.profile.resume}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center">
                                                    <FileText className="mr-2 h-4 w-4"/>View Resume
                                                </a>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem disabled><FileText className="mr-2 h-4 w-4"/>No Resume</DropdownMenuItem>
                                        )}
                                        {app.status !== 'accepted' && (
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(app._id, 'accepted')} className="cursor-pointer flex items-center">
                                                {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>} Accept
                                            </DropdownMenuItem>
                                        )}
                                        {app.status !== 'rejected' && (
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(app._id, 'rejected')} className="cursor-pointer flex items-center text-destructive">
                                                {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4"/>} Reject
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onSelect={() => openScheduleDialog(app)} className="cursor-pointer flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4"/>Schedule Interview
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStartChat(app.applicant._id)} className="cursor-pointer flex items-center">
                                            <MessageSquare className="mr-2 h-4 w-4" /> Chat with Applicant
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default ApplicantsTable;