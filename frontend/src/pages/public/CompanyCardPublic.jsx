import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const CompanyCardPublic = ({ company }) => {
    return (
        <Card className="flex flex-col text-center items-center p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0">
                <img src={company.logo || '/placeholder.gif'} alt={company.name} className="h-24 w-24 rounded-full object-cover border-4 border-background ring-2 ring-primary/20" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2 mt-4">
                <h3 className="text-xl font-bold">{company.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" /> {company.location || 'Global'}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-3 pt-2">
                    {company.description || "A great place to work."}
                </p>
            </CardContent>
            <CardFooter className="p-0 mt-4">
                <Button asChild variant="secondary" className="w-full">
                    <Link to={`/companies/${company._id}`}>View Profile & Jobs</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CompanyCardPublic;