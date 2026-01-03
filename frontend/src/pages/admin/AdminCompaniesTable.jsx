import { useToggleCompanyVerificationMutation } from "@/api/adminApi";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

const AdminCompaniesTable = ({ companies }) => {
    const [toggleVerification, { isLoading: isToggling }] = useToggleCompanyVerificationMutation();

    const handleToggle = (companyId, currentStatus) => {
        const promise = toggleVerification(companyId).unwrap();
        toast.promise(promise, {
            loading: 'Updating status...',
            success: (response) => response.message,
            error: (err) => err?.data?.message || 'Failed to update status.',
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created On</TableHead>
                    <TableHead className="text-right">Publicly Verified</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {companies.map((company) => (
                    <TableRow key={company._id}>
                        <TableCell className="font-medium flex items-center gap-3">
                            <img src={company.logo || '/placeholder-logo.png'} alt={company.name} className="h-10 w-10 rounded-lg object-cover"/>
                            <span>{company.name}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{company.owner?.fullName || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(company.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex items-center justify-end space-x-2">
                                <Switch
                                    id={`verify-switch-${company._id}`}
                                    checked={company.verified}
                                    onCheckedChange={() => handleToggle(company._id, company.verified)}
                                    disabled={isToggling}
                                />
                                <Label htmlFor={`verify-switch-${company._id}`} className="cursor-pointer min-w-[70px]">
                                    {company.verified ? 
                                        <Badge variant="success">Verified</Badge> : 
                                        <Badge variant="destructive">Unverified</Badge>
                                    }
                                </Label>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default AdminCompaniesTable;