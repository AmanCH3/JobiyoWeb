import { useGetChatbotSettingsQuery, useUpdateChatbotSettingsMutation } from "@/api/adminApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminChatbot = () => {
    const { data: settings, isLoading: isFetching, isError } = useGetChatbotSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateChatbotSettingsMutation();
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    
    useEffect(() => {
        if (settings) {
            reset({ systemPrompt: settings.systemPrompt });
        }
    }, [settings, reset]);

    const onSubmit = async (data) => {
        const promise = updateSettings(data).unwrap();
        toast.promise(promise, {
            loading: "Updating chatbot personality...",
            success: (res) => res.message || "Settings updated!",
            error: (err) => err?.data?.message || "Failed to update settings.",
        });
    };

    if (isFetching) {
        return (
            <div className="space-y-4">
                 <Skeleton className="h-8 w-1/3" />
                 <Skeleton className="h-4 w-2/3" />
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                    <CardFooter className="justify-end"><Skeleton className="h-10 w-24" /></CardFooter>
                 </Card>
            </div>
        )
    }

    if (isError) return <p className="text-destructive">Failed to load chatbot settings.</p>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Chatbot Personality</h1>
                <p className="text-muted-foreground">Define the core instructions, rules, and personality of your AI assistant.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary"/> System Prompt</CardTitle>
                    <CardDescription>
                        This is the master instruction set for the chatbot. It defines its name, purpose, rules, and conversational tone. 
                        It will always receive this prompt before answering any user query.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="systemPrompt">Prompt Instructions</Label>
                        <Textarea 
                            id="systemPrompt" 
                            rows={18} 
                            className="text-sm font-mono" 
                            {...register('systemPrompt', { required: "Prompt cannot be empty." })}
                        />
                        {errors.systemPrompt && <p className="text-destructive text-sm">{errors.systemPrompt.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="justify-end border-t pt-6">
                    <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default AdminChatbot;