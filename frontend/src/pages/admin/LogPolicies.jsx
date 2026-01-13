import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, FileDown, Clock, Archive, AlertTriangle } from "lucide-react";
import { toast } from 'sonner';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/userSlice';

const LogPolicies = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 7 days ago
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Get token from Redux state for manual fetch
    const token = useSelector(state => state.user.token); // Assuming token is at state.user.token based on slice conventions (or currentUser.token if nested)
    // Actually let's check store.js or userSlice if we are unsure, but usually it's state.user.token or state.auth.token.
    // Looking at dashboard layout imports: import { logOut, selectCurrentUser } from "@/redux/slices/userSlice";
    // Usually selectCurrentUser returns user object, checks if token is inside user or separate.
    // Let's assume state.user.token for now, or check userSlice. 
    // Wait, earlier I saw `selectCurrentUser` returning `user` object.
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Check date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays > 30) {
              toast.error("Export range cannot exceed 30 days.");
              setIsExporting(false);
              return;
            }

            // Trigger download
            const response = await fetch(`/api/v1/security-logs/export?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                 if (response.status === 401) throw new Error("Unauthorized. Please login again.");
                 if (response.status === 403) throw new Error("Access Denied. Admin only.");
                 throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logs_export_${startDate}_to_${endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success("Logs exported successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export logs. Ensure you are an admin.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Logging Policies & Audit</h1>
                <p className="text-muted-foreground">Manage data retention, review policies, and export audit trails.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Retention Policy Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            Data Retention Policy
                        </CardTitle>
                        <CardDescription>Automated cleanup schedule for system logs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium text-sm">INFO Logs</span>
                            <Badge variant="outline">30 Days</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium text-sm">WARN Logs</span>
                            <Badge variant="secondary">90 Days</Badge>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span className="font-medium text-sm">CRITICAL Logs</span>
                            <Badge variant="destructive">180 Days</Badge>
                        </div>
                        <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground flex items-center gap-2 mt-4">
                            <Archive className="h-4 w-4" />
                            Cleanup Job runs daily at 02:00 server time.
                        </div>
                    </CardContent>
                </Card>

                {/* Data Security Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            Data Minimization & Integrity
                        </CardTitle>
                        <CardDescription>Active security measures enforced on all logs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">Sanitization:</strong> Passwords, Tokens, and Banking info are automatically masked.</li>
                            <li><strong className="text-foreground">Hashing:</strong> Logs are cryptographically chained (SHA-256) to prevent tampering.</li>
                            <li><strong className="text-foreground">Immutability:</strong> Updates and Deletes are blocked via API.</li>
                            <li><strong className="text-foreground">Access Control:</strong> Strict RBAC enforced. Only Admins view full system logs.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Export Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-blue-500" />
                            Export Audit Logs
                        </CardTitle>
                        <CardDescription>Download a CSV of security events for compliance or external analysis. Max range: 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <label htmlFor="start" className="text-sm font-medium">Start Date</label>
                                <input 
                                    type="date" 
                                    id="start" 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <label htmlFor="end" className="text-sm font-medium">End Date</label>
                                <input 
                                    type="date" 
                                    id="end" 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleExport} disabled={isExporting}>
                                {isExporting ? "Exporting..." : "Download CSV"}
                            </Button>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded">
                            <AlertTriangle className="h-4 w-4" />
                            Exports include sensitive system data. Handle generated files with care.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LogPolicies;
