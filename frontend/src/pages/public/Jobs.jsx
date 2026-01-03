import { useGetPublicJobsQuery } from "@/api/jobApi";
import JobCard from "@/pages/public/JobCard";
import JobCardSkeleton from "@/components/skeletons/JobCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
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
        <div className="container mx-auto py-10">
            <Card className="mb-8 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1 space-y-2">
                        <Label htmlFor="keyword">Keyword or Title</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="keyword" placeholder="e.g., React Developer" className="pl-10" value={filters.keyword} onChange={(e) => handleFilterChange('keyword', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g., San Francisco" value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Job Type</Label>
                        <Select value={filters.jobType} onValueChange={(value) => handleFilterChange('jobType', value === 'all' ? '' : value)}>
                            <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
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
            </Card>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
            )}

            {!isLoading && isError && <p className="text-center text-destructive">Failed to load jobs.</p>}

            {!isLoading && !isError && jobs?.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => <JobCard key={job._id} job={job} />)}
                    </div>
                    {totalPages > 1 && (
                         <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button variant="outline" onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))} disabled={filters.page <= 1}>Previous</Button>
                                </PaginationItem>
                                <span className="p-2 text-sm font-medium">Page {filters.page} of {totalPages}</span>
                                <PaginationItem>
                                    <Button variant="outline" onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))} disabled={filters.page >= totalPages}>Next</Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

             {!isLoading && !isError && jobs?.length === 0 && (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold">No Jobs Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later.</p>
                </div>
            )}
        </div>
    );
};

export default JobsPublic;