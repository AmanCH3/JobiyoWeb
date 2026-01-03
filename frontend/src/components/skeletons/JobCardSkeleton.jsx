import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const JobCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default JobCardSkeleton;