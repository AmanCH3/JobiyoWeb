import { useGetCompaniesForAdminQuery } from "@/api/adminApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import AdminCompaniesTable from "@/pages/admin/AdminCompaniesTable";

const AdminCompanies = () => {
    const { data: companies, isLoading, isError, error } = useGetCompaniesForAdminQuery();

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-2xl font-bold tracking-tight">Company Verification</h1>
                <p className="text-muted-foreground">Manage and verify company profiles to make them public.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Companies</CardTitle>
                    <CardDescription>A list of all registered companies on the platform. Toggle the switch to verify and make them visible on the public site.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center items-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {isError && <p className="text-destructive text-center py-10">Error: {error?.data?.message || "Failed to load companies"}</p>}
                    
                    {companies && <AdminCompaniesTable companies={companies} />}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCompanies;