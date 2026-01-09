import { useGetSystemLogsQuery } from "@/api/adminApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SystemLogs = () => {
    const { data: logs, isLoading, isError, error, refetch } = useGetSystemLogsQuery(undefined, {
        pollingInterval: 30000, 
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground">Monitor system events, requests, and errors.</p>
                </div>
                <Button onClick={refetch} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card className="h-[calc(100vh-200px)] flex flex-col">
                <CardHeader>
                    <CardTitle>Log Stream</CardTitle>
                    <CardDescription>Showing recent system activities (Auto-refreshes every 30s)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    {isLoading && (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
                            <p>Failed to load logs.</p>
                            <p className="text-sm opacity-80">{error?.data?.message || "Unknown error"}</p>
                        </div>
                    )}

                    {logs && (
                        <div className="h-full overflow-y-auto w-full p-4 bg-black text-green-400 font-mono text-xs md:text-sm shadow-inner">
                             {logs.length === 0 ? (
                                <p className="text-gray-500 italic">No logs available.</p>
                             ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="mb-1 break-all hover:bg-white/5 p-0.5 rounded">
                                        <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                                        <span className={`uppercase font-bold mr-2 ${
                                            log.level === 'error' ? 'text-red-500' : 
                                            log.level === 'warn' ? 'text-yellow-500' : 'text-blue-400'
                                        }`}>
                                            [{log.level}]
                                        </span>
                                        <span>{log.message}</span>
                                    </div>
                                ))
                             )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemLogs;
