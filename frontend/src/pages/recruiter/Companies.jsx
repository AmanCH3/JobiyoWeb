import { useGetMyCompaniesQuery } from "@/api/companyApi";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Loader2, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import CompaniesTable from "@/pages/recruiter/CompaniesTable";
import CompanyCard from "@/pages/recruiter/CompaniesCard";

const Companies = () => {
    const { data: companies, isLoading, isError, error } = useGetMyCompaniesQuery();
    const [viewMode, setViewMode] = useState('grid');

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
        }
        if (isError) {
            return <p className="text-center text-destructive py-20">Error: {error?.data?.message || "Failed to load companies"}</p>;
        }
        if (!companies || companies.length === 0) {
            return (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">No Companies Found</h3>
                    <p className="text-muted-foreground mt-2">Get started by adding your first company profile.</p>
                    <Button asChild className="mt-4">
                        <Link to="/recruiter/companies/new"><PlusCircle className="mr-2 h-4 w-4" /> Add Company</Link>
                    </Button>
                </div>
            );
        }
        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map(company => <CompanyCard key={company._id} company={company} />)}
                </div>
            );
        }
        return <CompaniesTable companies={companies} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Companies</h1>
                    <p className="text-muted-foreground">Manage your company profiles and associated job listings.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-accent' : ''}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-accent' : ''}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button asChild>
                        <Link to="/recruiter/companies/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Company
                        </Link>
                    </Button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
}

export default Companies;