import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Building2 } from "lucide-react";

// Fallback company logos from real companies (using logo.dev CDN)
const getFallbackLogo = (companyName) => {
  const logoMap = {
    'google': 'https://logo.clearbit.com/google.com',
    'microsoft': 'https://logo.clearbit.com/microsoft.com',
    'apple': 'https://logo.clearbit.com/apple.com',
    'amazon': 'https://logo.clearbit.com/amazon.com',
    'meta': 'https://logo.clearbit.com/meta.com',
    'netflix': 'https://logo.clearbit.com/netflix.com',
    'spotify': 'https://logo.clearbit.com/spotify.com',
    'airbnb': 'https://logo.clearbit.com/airbnb.com',
    'uber': 'https://logo.clearbit.com/uber.com',
    'tesla': 'https://logo.clearbit.com/tesla.com',
  };
  
  const name = companyName?.toLowerCase() || '';
  for (const [key, logo] of Object.entries(logoMap)) {
    if (name.includes(key)) return logo;
  }
  return null;
};

const JobCard = ({ job }) => {
  const companyLogo = job.company?.logo || getFallbackLogo(job.company?.name);

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
      <CardHeader className="flex flex-row items-start gap-4">
        {companyLogo ? (
          <img 
            src={companyLogo} 
            alt={job.company?.name} 
            className="h-12 w-12 rounded-lg object-contain bg-white p-1 border"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="h-12 w-12 rounded-lg bg-primary/10 items-center justify-center flex-shrink-0"
          style={{ display: companyLogo ? 'none' : 'flex' }}
        >
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold truncate">{job.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{job.company?.name}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" /> 
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 flex-shrink-0" /> 
            <span>{job.jobType}</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-foreground">
            Rs. {job.salary?.toLocaleString()}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/jobs/${job._id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;