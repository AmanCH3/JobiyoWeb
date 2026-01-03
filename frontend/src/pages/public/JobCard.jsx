import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Briefcase } from "lucide-react";

const JobCard = ({ job }) => {

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4">
                <img src={job.company.logo || '/placeholder.gif'} alt={job.company.name} className="h-12 w-12 rounded-lg object-cover" />
                <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company.name}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.jobType}</div>
                    <div className="flex items-center gap-2">Rs. {job.salary}</div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link to={`/jobs/${job._id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default JobCard;