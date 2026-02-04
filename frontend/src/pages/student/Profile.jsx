import { selectCurrentUser, setCredentials } from "@/redux/slices/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateProfileMutation, useToggle2FAMutation, useSetup2FAMutation, useVerify2FASetupMutation } from "@/api/authApi";
import { useForm } from "react-hook-form";
// import { toast } from "sonner"; // Removed
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Mail, Link as LinkIcon, FileText, Shield, ShieldCheck, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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
    const { toast } = useToast();
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const [toggle2FA, { isLoading: isToggling }] = useToggle2FAMutation();
    const [setup2FA, { isLoading: isSettingUp }] = useSetup2FAMutation();
    const [verify2FASetup, { isLoading: isVerifying }] = useVerify2FASetupMutation();
    
    // 2FA Setup State
    const [showSetupDialog, setShowSetupDialog] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [setupSecret, setSetupSecret] = useState(null);
    const [verificationCode, setVerificationCode] = useState("");

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
            dispatch(setCredentials({ user: result.data, accessToken: null })); // Update user in store (keep token)
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update profile.");
        }
    };

    const handleSwitchChange = async (checked) => {
        if (checked) {
            // Enable: Start Setup Process
            try {
                const result = await setup2FA().unwrap();
                setQrCodeData(result.data.qrCode);
                setSetupSecret(result.data.secret);
                setShowSetupDialog(true);
            } catch (error) {
                toast.error(error?.data?.message || "Failed to start 2FA setup");
            }
        } else {
            // Disable: Call Toggle (which disables)
            try {
                const result = await toggle2FA().unwrap();
                 // Hack to update user in store since we don't have token here to perform full re-auth flow usually
                 // For now, let's just trigger a reload or optimistic update if we can
                 // The best way is to manually update the user object in Redux
                 // We need to fetch the existing user state effectively.
                 
                // Ideally InvalidatesTags should update the queries. If we are using useGetUserPublicProfile, it will update.
                // But we are using `user` from `selectCurrentUser`.
                
                window.location.reload(); 
                toast.success("2FA Disabled successfully.");
            } catch (error) {
                toast.error(error?.data?.message || "Failed to disable 2FA");
            }
        }
    };

    const handleVerifySetup = async () => {
        if (verificationCode.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        try {
            await verify2FASetup({ token: verificationCode, secret: setupSecret }).unwrap();
            setShowSetupDialog(false);
            setVerificationCode("");
            toast.success("2FA Enabled successfully!");
            window.location.reload(); // Reload to refresh user state
        } catch (error) {
            toast.error(error?.data?.message || "Verification failed. Please try again.");
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
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

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-emerald-600" />
                        <CardTitle className="text-xl">Account Security</CardTitle>
                    </div>
                    <CardDescription>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <div className="space-y-0.5">
                            <div className="font-medium text-base flex items-center gap-2">
                                Google Authenticator (2FA)
                                {user?.twoFactorEnabled && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Secure your account using Google Authenticator or compatible app.
                            </div>
                        </div>
                        <Switch 
                            checked={user?.twoFactorEnabled} 
                            onCheckedChange={handleSwitchChange}
                            disabled={isToggling || isSettingUp}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 2FA Setup Dialog */}
            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center flex flex-col items-center gap-2">
                             <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <QrCode className="h-6 w-6 text-emerald-600" />
                            </div>
                            Set up Two-Factor Authentication
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Scan the QR code below with your authenticator app (like Google Authenticator).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-6 py-4">
                        {qrCodeData && (
                            <div className="bg-white p-2 rounded-lg border-2 border-emerald-100">
                                <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                        )}
                        
                        <div className="space-y-2 text-center w-full">
                            <Label className="text-sm font-medium text-gray-500">Enter the 6-digit code from your app</Label>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(value) => setVerificationCode(value)}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowSetupDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                         <Button 
                            onClick={handleVerifySetup}
                            disabled={isVerifying || verificationCode.length !== 6}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Enable"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
