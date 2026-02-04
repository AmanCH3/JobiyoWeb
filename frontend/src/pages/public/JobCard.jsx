import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Building2, Bookmark, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

// Fallback company logos from real companies
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

// Get time ago string
const getTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const posted = new Date(date);
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const JobCard = ({ job }) => {
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState(false);
  const companyLogo = job.company?.logo || getFallbackLogo(job.company?.name);
  
  const isPromoted = job.promotion?.type === 'PROMOTED';
  const isFeatured = job.promotion?.type === 'FEATURED';
  const hasBoost = isPromoted || isFeatured;

  return (
    <Card className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer group
        ${hasBoost ? 'border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg'}
        bg-gray-50 dark:bg-slate-800/50 hover:-translate-y-2
    `}>
      {hasBoost && (
          <div className="absolute -top-3 right-6 z-10">
              <Badge className={`
                  ${isPromoted ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'} 
                  text-white border-0 px-3 py-1 shadow-md flex items-center gap-1.5
              `}>
                  {isPromoted ? <TrendingUp className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  {isPromoted ? 'Promoted' : 'Featured'}
              </Badge>
          </div>
      )}

      {/* Header - Logo and Save Button */}
      <div className="flex items-start justify-between mb-5">
        {/* Company Logo */}
        <div className="h-14 w-14 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
          {!imageError && companyLogo ? (
            <img 
              src={companyLogo} 
              alt={job.company?.name} 
              className="h-10 w-10 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Building2 className="h-7 w-7 text-gray-400" />
          )}
        </div>
        
        {/* Save Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            setSaved(!saved);
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700"
        >
          <span>Save</span>
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-emerald-500 text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Company Name and Time */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{job.company?.name}</span>
        <span className="text-sm text-gray-400">{getTimeAgo(job.createdAt)}</span>
      </div>

      {/* Job Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">
        {job.title}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-normal border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700">
          {job.jobType || 'Full-time'}
        </Badge>
        {job.workType && (
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm font-normal border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700">
            {job.workType}
          </Badge>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-slate-600 my-4" />

      {/* Footer - Salary and Apply Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${job.salary?.toLocaleString() || '0'}/hr
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{job.location || 'Remote'}</span>
          </div>
        </div>
        
        <Button 
          asChild 
          className="bg-primary hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white rounded-full px-6 py-2 font-medium"
        >
          <Link to={`/jobs/${job._id}`}>Apply now</Link>
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;