import { useGetPublicJobsQuery } from "@/api/jobApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const RealtimeSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const navigate = useNavigate();

    const { data, isLoading } = useGetPublicJobsQuery(
        { keyword: debouncedSearchTerm },
        { skip: !debouncedSearchTerm || !isFocused }
    );
    const suggestions = data?.jobs?.slice(0, 5);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        setIsFocused(false);
        navigate(`/jobs?keyword=${encodeURIComponent(searchTerm)}`);
    };

    const handleSuggestionClick = () => {
        setSearchTerm('');
        setIsFocused(false);
    };

    return (
        <form onSubmit={handleSearchSubmit}>
            <div className="relative max-w-2xl mx-auto">
                <div className="flex w-full bg-background rounded-lg shadow-lg border">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search by job title, skill, or company..."
                            className="pl-12 h-14 text-lg border-none focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        />
                        {isFocused && searchTerm && (
                            <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-10 overflow-hidden">
                                {isLoading && <div className="p-4 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Searching...</div>}
                                
                                {!isLoading && debouncedSearchTerm && suggestions?.length > 0 && (
                                    <ul>
                                        {suggestions.map(job => (
                                            <li key={job._id}>
                                                <Link 
                                                    to={`/jobs/${job._id}`} 
                                                    onClick={handleSuggestionClick}
                                                    className="block p-4 hover:bg-accent"
                                                >
                                                    <p className="font-semibold">{job.title}</p>
                                                    <p className="text-sm text-muted-foreground">{job.company.name}</p>
                                                </Link>
                                            </li>
                                        ))}
                                        <li className="p-2 border-t">
                                             <Button type="submit" variant="link" className="w-full">
                                                See all results for "{debouncedSearchTerm}"
                                            </Button>
                                        </li>
                                    </ul>
                                )}
                                
                                {!isLoading && debouncedSearchTerm && suggestions?.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground">No instant matches found. Hit Search for a full query.</div>
                                )}
                            </div>
                        )}
                    </div>
                    <Button type="submit" size="lg" className="h-14 rounded-l-none text-base">
                        Search
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default RealtimeSearch;