import { useGetPublicCompaniesQuery } from "@/api/companyApi";
import { Loader2 } from "lucide-react";
import CompanyCardPublic from "@/pages/public/CompanyCardPublic";

const CompaniesPublic = () => {
    const { data: companies, isLoading, isError } = useGetPublicCompaniesQuery();
    console.log(useGetPublicCompaniesQuery)

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
        }
        if (isError) {
            return <p className="text-center text-destructive py-20">Failed to load companies. Please try again later.</p>;
        }
        if (!companies || companies.length === 0) {
            return (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold">No Companies Available</h3>
                    <p className="text-muted-foreground mt-2">Check back later to see a list of our partner companies.</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {companies.map(company => <CompanyCardPublic key={company._id} company={company} />)}
            </div>
        );
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Explore Our Partner Companies</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover great places to work and find jobs directly from top-tier companies verified by our platform.</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default CompaniesPublic;