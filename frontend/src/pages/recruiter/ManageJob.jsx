import { useParams, useNavigate } from 'react-router-dom';
import { useGetJobByIdQuery, usePostJobMutation, useUpdateJobMutation } from '@/api/jobApi';
import { useGetMyCompaniesQuery } from '@/api/companyApi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  requirements: z.string().min(3, "Requirements must be listed."),
  salary: z.coerce.number().positive("Salary must be a positive number."),
  location: z.string().min(2, "Location is required."),
  jobType: z.string({ required_error: "Job type is required." }),
  experienceLevel: z.string({ required_error: "Experience level is required." }),
  companyId: z.string({ required_error: "Please select a company." }),
});

const ManageJob = () => {
    const { jobId } = useParams();
    const isEditMode = Boolean(jobId);
    const navigate = useNavigate();

    const { data: existingJob, isLoading: isFetchingJob } = useGetJobByIdQuery(jobId, { skip: !isEditMode });
    const { data: companies, isLoading: isFetchingCompanies } = useGetMyCompaniesQuery();

    const [postJob, { isLoading: isPosting }] = usePostJobMutation();
    const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(jobSchema),
    });

    useEffect(() => {
        if (isEditMode && existingJob) {
            reset({
                ...existingJob,
                requirements: existingJob.requirements.join(', '),
                companyId: existingJob.company,
            });
        }
    }, [isEditMode, existingJob, reset]);

    const onSubmit = async (data) => {
        const jobData = {
            ...data,
            requirements: data.requirements.split(',').map(req => req.trim()),
        };

        try {
            if (isEditMode) {
                await updateJob({ id: jobId, jobData }).unwrap();
                toast.success('Job updated successfully!');
            } else {
                await postJob(jobData).unwrap();
                toast.success('Job posted successfully!');
            }
            navigate('/recruiter/jobs');
        } catch (error) {
            toast.error(error?.data?.message || 'An error occurred.');
        }
    };

    const isLoading = isPosting || isUpdating;
    const isFetchingData = isFetchingJob || isFetchingCompanies;

    if (isFetchingData) {
        return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditMode ? 'Edit Job Posting' : 'Post a New Job'}</CardTitle>
                    <CardDescription>Fill in the job details below.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="companyId">Company</Label>
                            <Controller
                                name="companyId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                                        <SelectContent>
                                            {companies?.map(company => (
                                                <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.companyId && <p className="text-sm text-destructive">{errors.companyId.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" {...register('location')} />
                            {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="salary">Salary (Annual)</Label>
                            <Input id="salary" type="number" {...register('salary')} />
                            {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="jobType">Job Type</Label>
                            <Controller
                                name="jobType"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select job type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.jobType && <p className="text-sm text-destructive">{errors.jobType.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="experienceLevel">Experience Level</Label>
                            <Controller
                                name="experienceLevel"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Entry-level">Entry-level</SelectItem>
                                            <SelectItem value="Mid-level">Mid-level</SelectItem>
                                            <SelectItem value="Senior-level">Senior-level</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.experienceLevel && <p className="text-sm text-destructive">{errors.experienceLevel.message}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                        <Textarea id="requirements" {...register('requirements')} />
                        {errors.requirements && <p className="text-sm text-destructive">{errors.requirements.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea id="description" rows={7} {...register('description')} />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate('/recruiter/jobs')}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Save Job' : 'Post Job'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default ManageJob;