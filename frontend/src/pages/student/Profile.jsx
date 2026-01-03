import { selectCurrentUser, setCredentials } from "@/redux/slices/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateProfileMutation } from "@/api/authApi";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Mail, Link as LinkIcon, FileText } from "lucide-react";
import { useEffect, useState } from "react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  bio: z.string().optional(),
  skills: z.string().optional(),
  avatar: z.any().optional(),
  resume: z.any().optional(),
});

const Profile = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    
    const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar);
    const [resumeName, setResumeName] = useState(user?.profile?.resumeOriginalName);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName,
                bio: user.profile?.bio || '',
                skills: user.profile?.skills?.join(', ') || '',
            });
            setAvatarPreview(user.profile?.avatar);
            setResumeName(user.profile?.resumeOriginalName);
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        if (data.bio) formData.append('bio', data.bio);
        if (data.skills) formData.append('skills', data.skills);
        if (data.avatar && data.avatar[0]) formData.append('avatar', data.avatar[0]);
        if (data.resume && data.resume[0]) formData.append('resume', data.resume[0]);
        
        try {
            const result = await updateProfile(formData).unwrap();
            dispatch(setCredentials({ user: result.data, accessToken: null })); // Update user in store
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update profile.");
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Manage Your Profile</CardTitle>
                    <CardDescription>Keep your professional information up to date.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <img src={avatarPreview || '/placeholder.gif'} alt="Avatar" className="h-32 w-32 rounded-full object-cover border-4 border-primary/20" />
                                <Input 
                                    type="file" 
                                    id="avatar"
                                    accept="image/*" 
                                    className="text-sm"
                                    {...register('avatar')}
                                    onChange={(e) => setAvatarPreview(URL.createObjectURL(e.target.files[0]))}
                                />
                            </div>
                            <div className="flex-grow space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" {...register('fullName')} />
                                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                                </div>
                                 <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4"/>{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Professional Bio</Label>
                            <Textarea id="bio" rows={4} {...register('bio')} />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="skills">Skills (comma-separated)</Label>
                            <Input id="skills" placeholder="e.g., React, Node.js, Project Management" {...register('skills')} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="resume">Resume (PDF)</Label>
                            {resumeName && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4"/> 
                                    Current: <a href={user?.profile?.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{resumeName}</a>
                                </div>
                            )}
                            <Input 
                                id="resume" 
                                type="file" 
                                accept=".pdf"
                                className="text-sm"
                                {...register('resume')}
                                onChange={(e) => setResumeName(e.target.files[0]?.name)}
                            />
                            <p className="text-xs text-muted-foreground">Uploading a new file will replace the current one.</p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;