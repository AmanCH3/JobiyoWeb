import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Briefcase, Building2 } from "lucide-react";
import { useState } from "react";

const CompanyCardPublic = ({ company }) => {
  const [imageError, setImageError] = useState(false);

  // Use the actual company logo from database first
  const logoUrl = company.logo || null;
  
  // Fallback to Clearbit if no logo in database
  const getClearbitLogo = () => {
    const domain = company.website?.replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0] || '';
    if (domain) {
      return `https://logo.clearbit.com/${domain}`;
    }
    return null;
  };

  return (
    <Link to={`/companies/${company._id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {!imageError && (logoUrl || getClearbitLogo()) ? (
                <img 
                  src={logoUrl || getClearbitLogo()}
                  alt={`${company.name} logo`}
                  className="h-full w-full object-contain p-2"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Building2 className="h-7 w-7 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{company.name}</h3>
              {company.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{company.location}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {company.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {company.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {company.employeeCount && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{company.employeeCount} employees</span>
              </div>
            )}
            {company.activeJobs !== undefined && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{company.activeJobs} jobs</span>
              </div>
            )}
          </div>
          {company.industry && (
            <Badge variant="secondary" className="mt-3 text-xs">
              {company.industry}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CompanyCardPublic;
