import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeleteCompanyMutation } from "@/api/companyApi";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CompaniesTable = ({ companies }) => {
    const [deleteCompany, { isLoading }] = useDeleteCompanyMutation();

    const handleDelete = async (id) => {
        try {
            await deleteCompany(id).unwrap();
            toast.success("Company deleted successfully");
        } catch (err) {
            toast.error(err.data?.message || "Failed to delete company");
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {companies.map((company) => (
                    <TableRow key={company._id}>
                        <TableCell><img src={company.logo || '/placeholder-logo.png'} alt={company.name} className="h-10 w-10 rounded-full object-cover" /></TableCell>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.website || 'N/A'}</TableCell>
                        <TableCell>{company.location || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild><Link to={`/recruiter/companies/edit/${company._id}`} className="cursor-pointer flex items-center"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                                        <AlertDialogTrigger asChild><DropdownMenuItem className="cursor-pointer flex items-center text-destructive"><Trash className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the company and all associated jobs.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(company._id)} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                                            {isLoading ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default CompaniesTable;