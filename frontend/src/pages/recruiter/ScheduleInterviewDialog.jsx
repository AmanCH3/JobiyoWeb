import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { useScheduleInterviewMutation } from "@/api/interviewApi";
import { toast } from "sonner";

export const ScheduleInterviewDialog = ({ open, setOpen, application }) => {
    const { register, handleSubmit, control, watch } = useForm();
    const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
    const interviewType = watch("interviewType");

    const onSubmit = async (data) => {
        const promise = scheduleInterview({ ...data, applicationId: application._id }).unwrap();
        toast.promise(promise, {
            loading: 'Scheduling interview...',
            success: (res) => {
                setOpen(false);
                return res.message;
            },
            error: (err) => err.data.message
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Interview with {application.applicant.fullName}</DialogTitle>
                    <DialogDescription>For position: {application.job.title}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                 </form>
            </DialogContent>
        </Dialog>
    );
};