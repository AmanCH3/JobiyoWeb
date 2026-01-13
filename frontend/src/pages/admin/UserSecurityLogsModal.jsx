import React, { useState } from 'react';
import { useGetSecurityLogsQuery } from "@/api/securityLogApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { format } from 'date-fns';

const UserSecurityLogsModal = ({ userId, isOpen, onClose, userName }) => {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isError } = useGetSecurityLogsQuery(
        userId ? { userId, page, limit } : { skip: true }, // Skip if no userId
        { skip: !isOpen || !userId }
    );

    const logs = data?.data?.logs || [];
    const totalPages = data?.data?.totalPages || 1;

    const getActionBadge = (action, status) => {
        let variant = "secondary";
        let colorClass = "bg-gray-100 text-gray-800";

        if (status === "FAIL" || action === "SUSPICIOUS_ACTIVITY") {
            variant = "destructive";
        } else if (action.includes("LOGIN")) {
            colorClass = "bg-green-100 text-green-800";
        }

        return <Badge variant={variant} className={colorClass}>{action.replace(/_/g, " ")}</Badge>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Security Logs for {userName}</DialogTitle>
                    <DialogDescription>
                        Review authentication and security events for this user.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : isError ? (
                        <div className="text-center p-8 text-red-500">
                            Failed to load logs.
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            No security logs found for this user.
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell className="font-mono text-xs">
                                                {format(new Date(log.timestamp), 'MMM d, yy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                {getActionBadge(log.action, log.status)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-gray-600">
                                                {log.ip}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600">
                                                 {/* Assuming backend now sends simple devicedevice string or use UA */}
                                                {log.userAgent ? (
                                                    log.userAgent.includes("Mobile") ? "Mobile" : "Desktop"
                                                ) : "Unknown"}
                                            </TableCell>
                                            <TableCell>
                                                {log.status === 'SUCCESS' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Simple Pagination */}
                            <div className="flex justify-between items-center mt-4">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {totalPages}
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserSecurityLogsModal;
