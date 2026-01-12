import { useGetPublicJobsQuery } from "@/api/jobApi";
import JobCard from "@/pages/public/JobCard";
import JobCardSkeleton from "@/components/skeletons/JobCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const JobsPublic = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        location: searchParams.get('location') || '',
        jobType: searchParams.get('jobType') || '',
        page: Number(searchParams.get('page')) || 1,
    });
    const debouncedKeyword = useDebounce(filters.keyword, 500);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Reset page to 1 if a filter other than page changes
            if (key !== 'page') {
                newFilters.page = 1;
            }
            return newFilters;
        });
    }, []);

    useEffect(() => {
        const newParams = new URLSearchParams();
        if (debouncedKeyword) newParams.set('keyword', debouncedKeyword);
        if (filters.location) newParams.set('location', filters.location);
        if (filters.jobType) newParams.set('jobType', filters.jobType);
        if (filters.page > 1) newParams.set('page', String(filters.page));
        setSearchParams(newParams, { replace: true });
    }, [debouncedKeyword, filters.location, filters.jobType, filters.page, setSearchParams]);

    const { data, isLoading, isError } = useGetPublicJobsQuery({ ...filters, keyword: debouncedKeyword });
    const jobs = data?.jobs;
    const totalPages = data?.totalPages;

    return (
        <div className="container mx-auto py-12 md:py-16 max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Minimal Header */}
            <div className="mb-12 space-y-4 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                    Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">dream job</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Explore thousands of job opportunities with all the information you need. Its your future.
                </p>
            </div>

            {/* Clean Filters Section */}
            <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm md:shadow-md">
                    
                    {/* Keyword Search */}
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            id="keyword" 
                            placeholder="Job title, keywords, or company" 
                            className="pl-11 h-12 border-0 bg-transparent focus-visible:ring-0 text-base shadow-none rounded-xl" 
                            value={filters.keyword} 
                            onChange={(e) => handleFilterChange('keyword', e.target.value)} 
                        />
                    </div>

                    {/* Divider for desktop */}
                    <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-slate-700 mx-auto"></div>

                    {/* Location Search */}
                    <div className="md:col-span-4 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                         <Input 
                            id="location" 
                            placeholder="City, state, or remote" 
                            className="pl-11 h-12 border-0 bg-transparent focus-visible:ring-0 text-base shadow-none rounded-xl" 
                            value={filters.location} 
                            onChange={(e) => handleFilterChange('location', e.target.value)} 
                        />
                    </div>

                     {/* Job Type Select */}
                    <div className="md:col-span-2">
                        <Select value={filters.jobType} onValueChange={(value) => handleFilterChange('jobType', value === 'all' ? '' : value)}>
                            <SelectTrigger className="h-12 border-0 bg-gray-50 dark:bg-slate-800 focus:ring-0 rounded-xl px-4 text-base font-medium text-gray-700 dark:text-gray-200">
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 9 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
            )}

            {!isLoading && isError && (
                 <div className="text-center py-20 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700">
                    <p className="text-destructive font-medium">Failed to load jobs. Please try again later.</p>
                </div>
            )}

            {!isLoading && !isError && jobs?.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {jobs.map(job => <JobCard key={job._id} job={job} />)}
                    </div>
                    
                    {totalPages > 1 && (
                         <Pagination className="mt-16">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button variant="ghost" size="lg" onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))} disabled={filters.page <= 1} className="gap-2 pl-2.5">
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </Button>
                                </PaginationItem>
                                <span className="px-4 text-sm font-medium text-muted-foreground">Page {filters.page} of {totalPages}</span>
                                <PaginationItem>
                                   <Button variant="ghost" size="lg" onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))} disabled={filters.page >= totalPages} className="gap-2 pr-2.5">
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

             {!isLoading && !isError && jobs?.length === 0 && (
                <div className="text-center py-32 rounded-3xl bg-gray-50 dark:bg-slate-900/50 border border-dashed border-gray-200 dark:border-slate-800">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Jobs Found</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">We couldn't find any jobs matching your current filters. Try broadening your search.</p>
                    <Button 
                        variant="outline" 
                        className="mt-6"
                        onClick={() => {
                            setFilters({ keyword: '', location: '', jobType: '', page: 1 });
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

export default JobsPublic;