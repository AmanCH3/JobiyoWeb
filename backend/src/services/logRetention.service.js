import cron from 'node-cron';
import { ActivityLog } from '../models/activityLog.model.js';
import { logSecurityEvent } from '../utils/activityLogger.js';

// Retention Policy (Days)
const RETENTION_DAYS = {
    INFO: 30,
    WARN: 90,
    CRITICAL: 180
};

/**
 * Cleanup function to delete old logs based on retention policy.
 */
export const cleanupLogs = async () => {
    try {
        console.log("Starting Log Retention Cleanup...");
        let totalDeleted = 0;

        for (const [severity, days] of Object.entries(RETENTION_DAYS)) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await ActivityLog.deleteMany({
                severity: severity,
                timestamp: { $lt: cutoffDate }
            });

            if (result.deletedCount > 0) {
                console.log(`Deleted ${result.deletedCount} ${severity} logs older than ${days} days.`);
                totalDeleted += result.deletedCount;
            }
        }

        if (totalDeleted > 0) {
            // Log the cleanup action itself (as a system event)
            // Mock req object since this is a system job
            await logSecurityEvent({
                req: { 
                    ip: '127.0.0.1', 
                    headers: { 'user-agent': 'System/Cron' },
                    originalUrl: 'cron/cleanupLogs', 
                    method: 'DELETE'
                },
                action: 'SYSTEM_LOG_CLEANUP',
                severity: 'INFO',
                category: 'SYSTEM',
                status: 'SUCCESS',
                metadata: { totalDeleted, retentionPolicy: RETENTION_DAYS }
            });
        }
        
        console.log(`Log Cleanup Complete. Total deleted: ${totalDeleted}`);
    } catch (error) {
        console.error("Log Cleanup Failed:", error);
    }
};

/**
 * Initialize the cron job.
 * Runs daily at 02:00 AM server time.
 */
export const initLogRetention = () => {
    // Schedule: 0 2 * * * (At 02:00)
    cron.schedule('0 2 * * *', async () => {
        await cleanupLogs();
    });
    console.log("Log Retention Service Initialized (Schedule: Daily 02:00)");
};
