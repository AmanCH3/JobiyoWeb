import { useGetCompanyDetailPublicQuery } from "@/api/companyApi";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Globe, MapPin, ArrowLeft } from "lucide-react";
import JobCard from "@/pages/public/JobCard";
import JobCardSkeleton from "@/components/skeletons/JobCardSkeleton";
import { sanitizeHTML } from "@/utils/sanitize";

const CompanyDetails = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetCompanyDetailPublicQuery(companyId, { skip: !companyId });
    
    if (isLoading) return <div className="flex min-h-[60vh] justify-center items-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (isError) return <p className="text-center text-destructive py-10">Company not found or has not been verified.</p>;
    
    const { company, jobs } = data;

    return (
        <div className="bg-muted/30">
            <div className="bg-card border-b">
                <div className="container mx-auto py-12 md:py-16">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                    
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <img src={company.logo || '/placeholder.gif'} alt={company.name} className="h-28 w-28 rounded-xl object-cover border shadow-sm" />
                        <div className="flex-grow">
                            <h1 className="text-4xl font-bold tracking-tight">{company.name}</h1>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mt-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {company.location || 'Global'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    {company.website ? (
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                            Visit Website
                                        </a>
                                    ) : (
                                        'No website provided'
                                    )}
                                </div>
                            </div>
                            <div 
                                className="mt-4 text-gray-700 max-w-3xl prose-sm"
                                dangerouslySetInnerHTML={sanitizeHTML(company.description)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-12">
                <h2 className="text-2xl font-bold mb-6">Open Positions at {company.name} ({jobs.length})</h2>
                {jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => <JobCard key={job._id} job={job} comanyImage={company.logo} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
                        <p className="text-lg text-muted-foreground">This company currently has no open positions listed on Jobiyo.</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDetails;