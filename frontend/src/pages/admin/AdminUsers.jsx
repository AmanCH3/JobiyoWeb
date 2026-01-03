import { useGetAllUsersForAdminQuery } from "@/api/adminApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import AdminUsersTable from "@/pages/admin/AdminUsersTable";

const AdminUsers = () => {
    const { data: users, isLoading, isError, error } = useGetAllUsersForAdminQuery();

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">View and manage all registered users on the platform.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all users, including students, recruiters, and admins.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center items-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {isError && <p className="text-destructive text-center py-10">Error: {error?.data?.message || "Failed to load users"}</p>}
                    
                    {users && <AdminUsersTable users={users} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsers;