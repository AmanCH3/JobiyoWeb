import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const { method, url, ip } = req;
  const user = req.user ? req.user._id : 'Guest';

  // Log the request initiation
  logger.info(`Incoming Request: ${method} ${url} | User: ${user} | IP: ${ip}`);

  // Capture response finish to log status code
  res.on('finish', () => {
    const { statusCode } = res;
    if (statusCode >= 400) {
        logger.error(`Request Failed: ${method} ${url} | Status: ${statusCode} | User: ${user}`);
    } else {
        logger.info(`Request Completed: ${method} ${url} | Status: ${statusCode} | User: ${user}`);
    }
  });

  next();
};

export default requestLogger;
