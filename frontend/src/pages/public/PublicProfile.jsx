import { useGetUserPublicProfileQuery } from "@/api/authApi";
import { useParams } from "react-router-dom";
import { Loader2, Mail, FileText, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PublicProfile = () => {
    const { userId } = useParams();
    const { data: user, isLoading, isError } = useGetUserPublicProfileQuery(userId);

    if (isLoading) return <div className="flex h-screen justify-center items-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    if (isError) return <p className="text-center text-destructive py-10">User profile not found.</p>;

    return (
        <div className="container mx-auto py-12 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <img src={user.profile?.avatar || '/placeholder.gif'} alt={user.fullName} className="h-40 w-40 rounded-full object-cover border-4 border-primary/30" />
                    <h1 className="text-3xl font-bold mt-4">{user.fullName}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1"><Mail className="h-4 w-4" /> {user.email}</p>
                </div>
                <div className="flex-grow w-full border-t md:border-t-0 md:border-l pt-8 md:pt-0 md:pl-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Code className="h-5 w-5 text-primary"/> Skills</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {user.profile?.skills?.length > 0 ? 
                                    user.profile.skills.map(skill => <Badge key={skill}>{skill}</Badge>) :
                                    <p className="text-sm text-muted-foreground">No skills listed.</p>
                                }
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold">Bio</h3>
                            <p className="mt-2 text-muted-foreground">{user.profile?.bio || "No bio provided."}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Resume</h3>
                            {user.profile?.resume ? (
                                <Button asChild variant="outline" className="mt-2">
                                    <a href={`http://localhost:8000${user.profile.resume}`} target="_blank" rel="noopener noreferrer">
                                        <FileText className="mr-2 h-4 w-4"/> View Resume
                                    </a>
                                </Button>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-2">No resume uploaded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;