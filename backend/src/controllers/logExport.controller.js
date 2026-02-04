
import { ActivityLog } from "../models/activityLog.model.js";
import { logSecurityEvent } from "../utils/activityLogger.js";
import { json2csv } from "json-2-csv";
import { Readable } from 'stream';

/**
 * Export logs to CSV with date range filtering and strict max-range enforcement.
 */
export const exportLogs = async (req, res) => {
    try {
        const { startDate, endDate, category = 'ALL' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "startDate and endDate are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const MAX_RANGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

        if (end - start > MAX_RANGE_MS) {
            return res.status(400).json({ message: "Export range cannot exceed 30 days" });
        }

        const query = {
            timestamp: { $gte: start, $lte: end }
        };

        if (category && category !== 'ALL') {
            query.category = category;
        }

        // Audit this export action
        await logSecurityEvent({
            req,
            action: "LOG_EXPORT",
            severity: "WARN", // Notable action
            metadata: { startDate, endDate, category }
        });

        // Use cursor for streaming to avoid memory issues
        const cursor = ActivityLog.find(query).lean().cursor();
        
        const transformer = (doc) => {
             // Flatten metadata for CSV if possible, or stringify
             return {
                 Time: doc.timestamp?.toISOString(),
                 User: doc.userEmail || 'System',
                 Role: doc.role,
                 Action: doc.action,
                 Status: doc.status,
                 Severity: doc.severity,
                 IP: doc.ip,
                 Device: doc.device,
                 Metadata: doc.metadata ? JSON.stringify(doc.metadata) : ''
             };
        };

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="logs_export_${Date.now()}.csv"`);

        // Stream handling: Cursor -> Transform -> CSV -> Response
        // Note: json2csv streaming support is a bit specific, simplified usage:
        
        let headerWritten = false;
        
        cursor.on('data', (doc) => {
            const csvRow = json2csv([transformer(doc)], { 
                prependHeader: !headerWritten, // Only write header once
                keys: ['Time', 'User', 'Role', 'Action', 'Status', 'Severity', 'IP', 'Device', 'Metadata']
            });
            headerWritten = true;
            res.write(csvRow + '\n');
        });

        cursor.on('end', () => {
            res.end();
        });

        cursor.on('error', (err) => {
            console.error("Export stream error:", err);
            res.status(500).end();
        });

    } catch (error) {
        console.error("Log Export Failed:", error);
        res.status(500).json({ message: "Failed to export logs" });
    }
};
