import React, { useState } from 'react';
import { useGetMySecurityLogsQuery, useFlagSuspiciousActivityMutation } from "@/api/securityLogApi";
import { 
    Shield, 
    Smartphone, 
    Monitor, 
    MapPin, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    Info,
    Calendar,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertOctagon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns';
import { toast } from 'sonner';

const SecurityLogs = () => {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("ALL");
    const limit = 10;

    const { data, isLoading, isError, refetch } = useGetMySecurityLogsQuery({
        page,
        limit,
        eventType: filter === "ALL" ? "" : filter
    });

    const [flagSuspiciousActivity, { isLoading: isFlagging }] = useFlagSuspiciousActivityMutation();

    const handleFlagActivity = async (logId) => {
        try {
            await flagSuspiciousActivity(logId).unwrap();
            toast.success("Account Secured! All other sessions have been logged out.");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to flag activity");
        }
    };

    const logs = data?.data?.logs || [];
    const pagination = data?.data?.pagination || {};

    const getDeviceIcon = (device) => {
        if (!device) return <Info className="h-4 w-4 text-gray-400" />;
        const d = device.toLowerCase();
        if (d.includes("mobile") || d.includes("iphone") || d.includes("android")) return <Smartphone className="h-4 w-4 text-blue-500" />;
        if (d.includes("mac") || d.includes("windows") || d.includes("linux")) return <Monitor className="h-4 w-4 text-indigo-500" />;
        return <Info className="h-4 w-4 text-gray-400" />;
    };

    const getActionBadge = (action, status) => {
        let variant = "secondary";
        let colorClass = "bg-gray-100 text-gray-800";

        if (status === "FAIL") {
            variant = "destructive";
            colorClass = "bg-red-100 text-red-800 border-red-200";
        } else if (action.includes("LOGIN")) {
            colorClass = "bg-green-100 text-green-800 border-green-200";
        } else if (action.includes("PASSWORD")) {
            colorClass = "bg-amber-100 text-amber-800 border-amber-200";
        } else if (action === "SUSPICIOUS_ACTIVITY" || action === "ACCOUNT_FLAGGED") {
            colorClass = "bg-red-100 text-red-800 border-red-200 font-bold";
            return <Badge variant="destructive" className={`${colorClass} whitespace-nowrap flex items-center gap-1`}>
                <AlertOctagon className="h-3 w-3" /> {action.replace(/_/g, " ")}
            </Badge>;
        }

        return <Badge variant={variant} className={`${colorClass} whitespace-nowrap`}>{action.replace(/_/g, " ")}</Badge>;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                    Security Logs
                </h1>
                <p className="mt-2 text-gray-600">
                    Review your recent account activity, sign-ins, and security-related events.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Last Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {logs[0] ? format(new Date(logs[0].timestamp), 'MMM d, HH:mm') : '-'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {logs[0]?.action?.replace(/_/g, " ") || 'No activity'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Security Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Total recorded events</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                           <div className="h-3 w-3 rounded-full bg-green-500"></div>
                           <span className="text-md font-bold text-green-700">Active & Secure</span>
                        </div>
                         <p className="text-xs text-gray-500 mt-1">No critical alerts</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-indigo-500 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Activity History</CardTitle>
                        <CardDescription>Detailed log of your account usage.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <select 
                            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                            value={filter}
                            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                        >
                            <option value="ALL">All Events</option>
                            <option value="AUTH_LOGIN">Logins</option>
                            <option value="AUTH_PASSWORD_CHANGE">Password Changes</option>
                            <option value="AUTH_LOGIN_FAIL">Failed Attempts</option>
                        </select>
                        <Button variant="outline" size="icon" onClick={() => refetch()} >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Event</th>
                                    <th className="px-6 py-3">Device / IP</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading security logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No security events found.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(log.timestamp), 'MMM d, yyyy')}</span>
                                                    <span className="text-xs text-gray-500">{format(new Date(log.timestamp), 'h:mm:ss a')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getActionBadge(log.action, log.status)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    {getDeviceIcon(log.device)}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{log.device || "Unknown Device"}</span>
                                                        <span className="text-xs text-gray-400">{log.ip}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.status === 'SUCCESS' ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                                                        <CheckCircle className="h-3 w-3" /> Success
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 font-medium text-xs">
                                                        <XCircle className="h-3 w-3" /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                 {log.status === 'FAIL' || log.action === 'SUSPICIOUS_ACTIVITY' ? (
                                                     <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8"
                                                        onClick={() => handleFlagActivity(log._id)}
                                                        disabled={isFlagging}
                                                     >
                                                        <AlertTriangle className="h-3 w-3 mr-1" /> {isFlagging ? 'Securing...' : 'Is this you?'}
                                                     </Button>
                                                 ) : (
                                                     <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-8">
                                                        Details
                                                     </Button>
                                                 )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                             <div className="text-xs text-gray-500">
                                Page buffer {pagination.page} of {pagination.totalPages}
                             </div>
                             <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SecurityLogs;
