import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

const roleBadgeVariant = {
    student: 'default',
    recruiter: 'secondary',
    admin: 'destructive',
};

const AdminUsersTable = ({ users }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered On</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user._id}>
                        <TableCell className="font-medium flex items-center gap-3">
                            <img src={user.profile?.avatar || '/placeholder.gif'} alt={user.fullName} className="h-10 w-10 rounded-full object-cover"/>
                            <span>{user.fullName}</span>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant={roleBadgeVariant[user.role]} className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default AdminUsersTable;