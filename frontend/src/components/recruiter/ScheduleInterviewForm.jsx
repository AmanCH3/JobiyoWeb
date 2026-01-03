import { useScheduleInterviewMutation } from "@/api/interviewApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const interviewSchema = z.object({
  interviewType: z.enum(['online', 'inoffice'], { required_error: "Please select an interview type." }),
  date: z.date({ required_error: "A date for the interview is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use a valid HH:MM format."),
  locationOrLink: z.string().min(5, "This field requires at least 5 characters."),
});

const ScheduleInterviewForm = ({ applicationId, closeDialog }) => {
    const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
        resolver: zodResolver(interviewSchema),
        defaultValues: { interviewType: 'online' }
    });
    const interviewType = watch("interviewType");

    const onSubmit = async (data) => {
        const promise = scheduleInterview({ ...data, applicationId }).unwrap();
        toast.promise(promise, {
            loading: "Scheduling interview...",
            success: (res) => {
                closeDialog();
                return res.message || "Interview scheduled successfully!";
            },
            error: (err) => err?.data?.message || "Failed to schedule interview.",
        });
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 pt-4">
            <div className="grid gap-3">
                <Label>Interview Type</Label>
                <Controller
                    name="interviewType"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <Label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer has-[input:checked]:border-primary flex-1 justify-center">
                                <RadioGroupItem value="online" /> Online
                            </Label>
                            <Label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer has-[input:checked]:border-primary flex-1 justify-center">
                                <RadioGroupItem value="inoffice" /> In-Office
                            </Label>
                        </RadioGroup>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground", errors.date && "border-destructive")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="time">Time (24-hour)</Label>
                    <Input id="time" type="time" {...register('time')} className={cn(errors.time && "border-destructive")} />
                    {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="locationOrLink">{interviewType === 'inoffice' ? 'Full Office Address' : 'Video Meeting Link'}</Label>
                <Input id="locationOrLink" placeholder={interviewType === 'inoffice' ? 'e.g., 123 Main St, Anytown' : 'e.g., https://meet.google.com/xyz'} {...register('locationOrLink')} className={cn(errors.locationOrLink && "border-destructive")} />
                {errors.locationOrLink && <p className="text-sm text-destructive">{errors.locationOrLink.message}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="mt-2 w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Confirm & Schedule Interview
            </Button>
        </form>
    );
};

export default ScheduleInterviewForm;