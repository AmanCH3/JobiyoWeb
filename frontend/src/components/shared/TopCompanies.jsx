import { useGetPublicCompaniesQuery } from "@/api/companyApi";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import Marquee from "react-fast-marquee";

const CompanyLogoCard = ({ company }) => (
    <Link to={`/jobs?company=${company.name}`} title={`View jobs at ${company.name}`}>
        <Card className="p-4 flex items-center justify-center h-28 transition-all hover:shadow-md hover:border-primary">
            <img src={company.logo || '/placeholder-logo.png'} alt={`${company.name} logo`} className="max-h-20 max-w-full object-contain" />
        </Card>
    </Link>
);


const TopCompanies = () => {
    const { data: companies, isLoading, isError } = useGetPublicCompaniesQuery(undefined, {
        selectFromResult: ({ data, ...rest }) => ({
            data: data?.slice(0, 8), 
            ...rest
        }),
    });

    return (
        <section className="py-12 md:py-20">
            <div className="container mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Featured Companies
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        We are proud to partner with these innovative and leading companies.
                    </p>
                </div>

                {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                
                {isError && (
                     <div className="text-center text-destructive">
                        <p>Could not load companies at this time.</p>
                    </div>
                )}

                {companies && companies.length > 0 && (
                                    <Marquee
                                    pauseOnHover={true}
                    speed={40}
                    gradient={false} 
                    >


                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {companies.map(company => <CompanyLogoCard key={company._id} company={company} />)}
                    </div>
                    </Marquee>
                )}
                
                <div className="text-center mt-12">
                    <Button asChild variant="outline">
                        <Link to="/companies">
                            <Building2 className="mr-2 h-4 w-4"/>
                            Explore All Companies
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default TopCompanies;