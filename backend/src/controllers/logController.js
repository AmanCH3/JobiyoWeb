import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path relative to where this file is located (src/controllers)
// logs folder is in root/logs. So ../../logs
const LOG_FILE_PATH = path.join(__dirname, '../../logs/app.log');

export const getSystemLogs = async (req, res) => {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return res.status(200).json({ logs: [] });
    }

    const data = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    
    // Split by newline and filter empty lines
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    // Parse each line as JSON
    // We reverse to show newest logs first
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(log => log !== null).reverse();

    // Limit to last 200 logs to avoid huge payload
    const recentLogs = logs.slice(0, 200);

    res.status(200).json({
      success: true,
      count: recentLogs.length,
      logs: recentLogs
    });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs',
      error: error.message
    });
  }
};
