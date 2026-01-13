import React, { useState, useMemo } from 'react';
import { useGetSystemLogsQuery } from "@/api/adminApi";
import { 
    RefreshCw, 
    Search, 
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Info,
    AlertTriangle,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SystemLogs = () => {
    const { data, isLoading, isError, error, refetch } = useGetSystemLogsQuery(undefined, {
        pollingInterval: 30000, 
    });

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filterLevel, setFilterLevel] = useState("ALL");
    const logsPerPage = 15;

    // Helper to parse log message string into structured data
    const parseLogMessage = (message) => {
        if (!message) return {};
        
        let method = "-";
        let route = "-";
        let status = "-";
        let user = "-";
        let ip = "-";
        let type = "INFO";

        // Try to detect common patterns from our logger middleware
        // Pattern: "Incoming Request: METHOD URL | User: ... | IP: ..."
        if (message.includes("Incoming Request:")) {
            type = "REQUEST_IN";
            const parts = message.split("|");
            const reqPart = parts[0]?.replace("Incoming Request:", "").trim();
            const userPart = parts[1]?.trim();
            const ipPart = parts[2]?.trim();

            if (reqPart) {
                const [m, u] = reqPart.split(" ");
                method = m || "-";
                route = u || "-";
            }
            if (userPart) user = userPart.replace("User:", "").trim();
            if (ipPart) ip = ipPart.replace("IP:", "").trim();
        } 
        // Pattern: "Request Completed: METHOD URL | Status: ... | User: ..."
        else if (message.includes("Request Completed:")) {
            type = "REQUEST_OUT";
            const parts = message.split("|");
            const reqPart = parts[0]?.replace("Request Completed:", "").trim();
            const statusPart = parts[1]?.trim();
            const userPart = parts[2]?.trim();

            if (reqPart) {
                const [m, u] = reqPart.split(" ");
                method = m || "-";
                route = u || "-";
            }
            if (statusPart) status = statusPart.replace("Status:", "").trim();
            if (userPart) user = userPart.replace("User:", "").trim();
        }
        // Pattern: "Request Failed: METHOD URL | Status: ... | User: ..."
        else if (message.includes("Request Failed:")) {
            type = "REQUEST_ERR";
            const parts = message.split("|");
            const reqPart = parts[0]?.replace("Request Failed:", "").trim();
            const statusPart = parts[1]?.trim();
            const userPart = parts[2]?.trim();

            if (reqPart) {
                const [m, u] = reqPart.split(" ");
                method = m || "-";
                route = u || "-";
            }
            if (statusPart) status = statusPart.replace("Status:", "").trim();
            if (userPart) user = userPart.replace("User:", "").trim();
        }
        
        return { method, route, status, user, ip, type, original: message };
    };

    const logs = data || [];

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = search.toLowerCase() === "" || 
                log.message.toLowerCase().includes(search.toLowerCase()) ||
                log.level.toLowerCase().includes(search.toLowerCase());
            
            const matchesLevel = filterLevel === "ALL" || log.level.toUpperCase() === filterLevel;

            return matchesSearch && matchesLevel;
        });
    }, [logs, search, filterLevel]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);

    const getLevelBadge = (level) => {
        switch (level?.toLowerCase()) {
            case 'error':
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">ERROR</Badge>;
            case 'warn':
                return <Badge variant="warning" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">WARN</Badge>;
            case 'info':
            default:
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">INFO</Badge>;
        }
    };

    const getMethodColor = (method) => {
        switch (method?.toUpperCase()) {
            case 'GET': return 'text-blue-600 bg-blue-50';
            case 'POST': return 'text-green-600 bg-green-50';
            case 'PUT': return 'text-orange-600 bg-orange-50';
            case 'DELETE': return 'text-red-600 bg-red-50';
            case 'PATCH': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Logs</h1>
                    <p className="text-gray-500 mt-1">Monitor system events, API requests, and server errors.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                     <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="relative md:col-span-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div>
                        <select
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filterLevel}
                            onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
                        >
                            <option value="ALL">All Levels</option>
                            <option value="INFO">Info</option>
                            <option value="WARN">Warning</option>
                            <option value="ERROR">Error</option>
                        </select>
                    </div>
                     <div className="flex justify-end items-center">
                        <span className="text-sm text-gray-500">
                             Showing {filteredLogs.length} logs
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method / Route</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / IP</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                    </tr>
                                ))
                            ) : paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Info className="h-10 w-10 text-gray-300 mb-2" />
                                            <p>No logs found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log, index) => {
                                    const parsed = parseLogMessage(log.message);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors text-sm">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getLevelBadge(log.level)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {parsed.method !== '-' ? (
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMethodColor(parsed.method)}`}>
                                                            {parsed.method}
                                                        </span>
                                                        <span className="text-gray-700 font-medium max-w-[200px] truncate" title={parsed.route}>
                                                            {parsed.route}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {parsed.status !== '-' ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        parsed.status.startsWith('2') ? 'bg-green-100 text-green-800' :
                                                        parsed.status.startsWith('3') ? 'bg-blue-100 text-blue-800' :
                                                        parsed.status.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {parsed.status}
                                                    </span>
                                                ) : (
                                                     <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-medium">{parsed.user}</span>
                                                    {parsed.ip !== '-' && <span className="text-gray-400 text-xs">{parsed.ip}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-md truncate" title={log.message}>
                                                {parsed.method === '-' ? log.message : (
                                                    // Detailed view for requests
                                                    parsed.type === 'REQUEST_IN' ? 'Incoming request received' :
                                                    parsed.type === 'REQUEST_OUT' ? 'Request completed successfully' :
                                                    'Request failed'
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(page - 1) * logsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * logsPerPage, filteredLogs.length)}</span> of{' '}
                                    <span className="font-medium">{filteredLogs.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        // Simple Logic for now - ideally should handle many pages
                                        let pageNum = idx + 1;
                                        // Adjust window if page > 3
                                        if (totalPages > 5 && page > 3) {
                                            pageNum = page - 2 + idx;
                                            if (pageNum > totalPages) pageNum = pageNum - (pageNum - totalPages);
                                        }

                                        if (pageNum <= totalPages) return (
                                             <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    page === pageNum 
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                        return null;
                                    })}

                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemLogs;
