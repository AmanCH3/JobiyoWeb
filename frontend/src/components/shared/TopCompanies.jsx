import { useGetPublicCompaniesQuery } from "@/api/companyApi";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "../ui/button";

// Fallback logos for well-known companies
const getFallbackLogo = (companyName) => {
  const logoMap = {
    'google': 'https://logo.clearbit.com/google.com',
    'microsoft': 'https://logo.clearbit.com/microsoft.com',
    'apple': 'https://logo.clearbit.com/apple.com',
    'amazon': 'https://logo.clearbit.com/amazon.com',
    'meta': 'https://logo.clearbit.com/meta.com',
    'facebook': 'https://logo.clearbit.com/facebook.com',
    'netflix': 'https://logo.clearbit.com/netflix.com',
    'spotify': 'https://logo.clearbit.com/spotify.com',
    'airbnb': 'https://logo.clearbit.com/airbnb.com',
    'uber': 'https://logo.clearbit.com/uber.com',
    'tesla': 'https://logo.clearbit.com/tesla.com',
    'twitter': 'https://logo.clearbit.com/twitter.com',
    'linkedin': 'https://logo.clearbit.com/linkedin.com',
    'adobe': 'https://logo.clearbit.com/adobe.com',
    'salesforce': 'https://logo.clearbit.com/salesforce.com',
    'oracle': 'https://logo.clearbit.com/oracle.com',
    'ibm': 'https://logo.clearbit.com/ibm.com',
    'intel': 'https://logo.clearbit.com/intel.com',
    'nvidia': 'https://logo.clearbit.com/nvidia.com',
    'samsung': 'https://logo.clearbit.com/samsung.com',
  };
  
  const name = companyName?.toLowerCase() || '';
  for (const [key, logo] of Object.entries(logoMap)) {
    if (name.includes(key)) return logo;
  }
  
  // Try to get logo from clearbit using company name
  if (companyName) {
    const domain = companyName.toLowerCase().replace(/\s+/g, '') + '.com';
    return `https://logo.clearbit.com/${domain}`;
  }
  
  return null;
};

const CompanyLogoCard = ({ company }) => {
  const logo = company.logo || getFallbackLogo(company.name);
  
  return (
    <Link to={`/jobs?company=${company.name}`} title={`View jobs at ${company.name}`}>
      <Card className="mx-3 p-6 flex items-center justify-center h-28 w-40 transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 duration-300 bg-white dark:bg-slate-800">
        {logo ? (
          <img 
            src={logo} 
            alt={`${company.name} logo`} 
            className="max-h-16 max-w-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="flex-col items-center justify-center gap-2"
          style={{ display: logo ? 'none' : 'flex' }}
        >
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xs font-medium text-center truncate max-w-full">{company.name}</span>
        </div>
      </Card>
    </Link>
  );
};

const TopCompanies = () => {
  const { data: companies, isLoading, isError } = useGetPublicCompaniesQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.slice(0, 10), 
      ...rest
    }),
  });

  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Featured Companies
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            We are proud to partner with these innovative and leading companies.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {isError && (
          <div className="text-center text-destructive py-8">
            <p>Could not load companies at this time.</p>
          </div>
        )}

        {companies && companies.length > 0 && (
          <div className="overflow-hidden">
            <div className="flex animate-marquee">
              {[...companies, ...companies].map((company, index) => (
                <CompanyLogoCard key={`${company._id}-${index}`} company={company} />
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="rounded-full">
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