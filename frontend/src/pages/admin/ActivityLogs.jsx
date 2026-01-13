import React, { useState } from 'react';
import { useGetActivityLogsQuery } from '../../api/activityLogApi';
import ActivityLogDrawer from '../../components/admin/ActivityLogDrawer';
import { 
    MagnifyingGlassIcon, 
    FunnelIcon, 
    CalendarIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const ActivityLogs = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        role: "",
        action: "",
        status: "",
        severity: "",
        startDate: "",
        endDate: ""
    });
    const [selectedLog, setSelectedLog] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { data, isLoading, isError, refetch } = useGetActivityLogsQuery({
        page,
        limit,
        q: search,
        ...filters
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // Reset to page 1 on filter change
    };

    const handleClearFilters = () => {
        setFilters({
            role: "",
            action: "",
            status: "",
            severity: "",
            startDate: "",
            endDate: ""
        });
        setSearch("");
        setPage(1);
    };

    const handleRowClick = (log) => {
        setSelectedLog(log);
        setDrawerOpen(true);
    };

    if (isError) {
        toast.error("Failed to load activity logs");
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Activity Logs
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Monitor user actions, security events, and system errors.
                        </p>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                         <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={() => refetch()}
                        >
                            <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Search */}
                        <div className="relative rounded-md shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Search action, user, entity..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">All Statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAIL">Failure</option>
                        </select>

                        {/* Severity Filter */}
                        <select
                            name="severity"
                            value={filters.severity}
                            onChange={handleFilterChange}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                             <option value="">All Severities</option>
                             <option value="INFO">Info</option>
                             <option value="WARN">Warning</option>
                             <option value="CRITICAL">Critical</option>
                        </select>

                         {/* Role Filter */}
                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">All Roles</option>
                            <option value="student">Student/Candidate</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                        </select>
                        
                         {/* Date Range - simplified as text for now, could use a date picker lib */}
                        <div className='col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-2'>
                           <input 
                                type="date" 
                                name="startDate" 
                                value={filters.startDate} 
                                onChange={handleFilterChange} 
                                className="block w-full rounded-md border-0 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                            />
                           <input 
                                type="date" 
                                name="endDate" 
                                value={filters.endDate} 
                                onChange={handleFilterChange} 
                                className="block w-full rounded-md border-0 py-1.5 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                            />
                        </div>

                        <button 
                            onClick={handleClearFilters}
                            className='text-sm text-indigo-600 hover:text-indigo-900 font-medium'
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Timestamp</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Entity</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Severity</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="py-4 pl-4 pr-3 sm:pl-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        </tr>
                                    ))
                                ) : data?.data?.logs?.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <MagnifyingGlassIcon className="h-10 w-10 text-gray-300 mb-2" />
                                                <p>No activity logs found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data?.data?.logs?.map((log) => (
                                        <tr 
                                            key={log._id} 
                                            onClick={() => handleRowClick(log)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                {log.action}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {log.userEmail || 'System'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                {log.role || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {log.entityType ? `${log.entityType}:${log.entityId?.substring(0,6)}...` : '-'}
                                            </td>
                                           <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                                                    log.severity === 'WARN' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {log.severity}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {log.ip}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data?.data?.total > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(data?.data?.totalPages, page + 1))}
                                    disabled={page === data?.data?.totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, data?.data?.total)}</span> of{' '}
                                        <span className="font-medium">{data?.data?.total}</span> results
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
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        
                                        {/* Simple Pagination Numbers (Can be improved for many pages) */}
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                            {page}
                                        </span>

                                        <button
                                            onClick={() => setPage(Math.min(data?.data?.totalPages, page + 1))}
                                            disabled={page === data?.data?.totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ActivityLogDrawer open={drawerOpen} setOpen={setDrawerOpen} log={selectedLog} />
        </div>
    );
};

export default ActivityLogs;
