import { useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import UserSecurityLogsInline from './UserSecurityLogsInline';

const roleBadgeVariant = {
    student: 'default',
    recruiter: 'secondary',
    admin: 'destructive',
};

const AdminUsersTable = ({ users }) => {
    const [expandedUserIds, setExpandedUserIds] = useState({});

    const toggleRow = (userId) => {
        setExpandedUserIds(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <Fragment key={user._id}>
                        <TableRow className={expandedUserIds[user._id] ? "bg-muted/50 border-b-0" : ""}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <img src={user.profile?.avatar || '/placeholder.gif'} alt={user.fullName} className="h-10 w-10 rounded-full object-cover"/>
                                <span>{user.fullName}</span>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={roleBadgeVariant[user.role]} className="capitalize">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => toggleRow(user._id)}
                                >
                                    {expandedUserIds[user._id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </TableCell>
                        </TableRow>
                        {expandedUserIds[user._id] && (
                            <TableRow>
                                <TableCell colSpan={5} className="p-0 bg-muted/50">
                                    <div className="px-4 pb-4">
                                        <UserSecurityLogsInline userId={user._id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </Fragment>
                ))}
            </TableBody>
        </Table>
    );
};

export default AdminUsersTable;