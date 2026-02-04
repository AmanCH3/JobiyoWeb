import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { useScheduleInterviewMutation } from "@/api/interviewApi";
import { useToast } from "@/context/ToastContext";

export const ScheduleInterviewDialog = ({ open, setOpen, application }) => {
    const { toast } = useToast();
    const { register, handleSubmit, control, watch } = useForm();
    const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
    const interviewType = watch("interviewType");

    const onSubmit = async (data) => {
        try {
            const res = await scheduleInterview({ ...data, applicationId: application._id }).unwrap();
            setOpen(false);
            toast.success(res.message || "Interview scheduled!");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to schedule interview.");
        }
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