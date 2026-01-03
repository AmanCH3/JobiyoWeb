import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Trash, Globe, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeleteCompanyMutation } from "@/api/companyApi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const CompanyCard = ({ company }) => {
    const [deleteCompany, { isLoading }] = useDeleteCompanyMutation();

    const handleDelete = async () => {
        const promise = deleteCompany(company._id).unwrap();
        toast.promise(promise, {
            loading: 'Deleting company...',
            success: 'Company deleted successfully.',
            error: (err) => err?.data?.message || 'Failed to delete company.',
        });
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                    <img src={company.logo || '/placeholder-logo.png'} alt={company.name} className="h-16 w-16 rounded-lg object-cover border" />
                    <div>
                        <h3 className="text-lg font-bold">{company.name}</h3>
                        {company.verified && <Badge variant="success">Verified</Badge>}
                    </div>
                </div>
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><i data-lucide="more-vertical" className="h-4 w-4"></i></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link to={`/recruiter/companies/edit/${company._id}`} className="cursor-pointer flex items-center w-full"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <AlertDialogTrigger asChild><DropdownMenuItem className="cursor-pointer flex items-center text-destructive w-full focus:bg-destructive focus:text-destructive-foreground"><Trash className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the company and all associated jobs. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                                {isLoading ? "Deleting..." : "Confirm Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{company.description || "No description provided."}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {company.location || 'Location not set'}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{company.website}</a> : 'Website not set'}
                </div>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="secondary" className="w-full">
                    <Link to={`/recruiter/jobs?companyId=${company._id}`}>View Jobs</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CompanyCard;