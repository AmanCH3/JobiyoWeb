import React from 'react';
import { useGetSecurityLogsQuery } from "@/api/securityLogApi";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { format } from 'date-fns';

const UserSecurityLogsInline = ({ userId }) => {
    // Fetch last 5 logs for inline view
    const { data, isLoading, isError } = useGetSecurityLogsQuery(
        { userId, page: 1, limit: 5 },
        { skip: !userId }
    );

    const logs = data?.data?.logs || [];

    const getActionBadge = (action, status) => {
        let variant = "secondary";
        let colorClass = "bg-gray-100 text-gray-800";

        if (status === "FAIL" || action === "SUSPICIOUS_ACTIVITY") {
            variant = "destructive";
        } else if (action.includes("LOGIN")) {
            colorClass = "bg-green-100 text-green-800";
        }

        return <Badge variant={variant} className={`text-xs ${colorClass}`}>{action.replace(/_/g, " ")}</Badge>;
    };

    if (isLoading) {
        return <div className="p-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>;
    }

    if (isError) {
        return <div className="p-4 text-xs text-red-500">Failed to load logs.</div>;
    }

    if (logs.length === 0) {
        return <div className="p-4 text-xs text-gray-500">No recent security activity recorded.</div>;
    }

    return (
        <div className="rounded-md border bg-gray-50/50 m-2">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-xs">Time</TableHead>
                        <TableHead className="h-8 text-xs">Event</TableHead>
                        <TableHead className="h-8 text-xs">IP Address</TableHead>
                        <TableHead className="h-8 text-xs">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log._id} className="hover:bg-transparent">
                            <TableCell className="py-2 text-xs font-mono text-gray-600">
                                {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                            </TableCell>
                            <TableCell className="py-2">
                                {getActionBadge(log.action, log.status)}
                            </TableCell>
                            <TableCell className="py-2 text-xs font-mono text-gray-500">
                                {log.ip}
                            </TableCell>
                            <TableCell className="py-2">
                                {log.status === 'SUCCESS' ? (
                                    <span className="flex items-center text-xs text-green-600 gap-1"><CheckCircle className="h-3 w-3" /> Pass</span>
                                ) : (
                                    <span className="flex items-center text-xs text-red-600 gap-1"><XCircle className="h-3 w-3" /> Fail</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <div className="p-2 text-center border-t">
                <span className="text-xs text-gray-400 italic">Showing last 5 events</span>
            </div>
        </div>
    );
};

export default UserSecurityLogsInline;
