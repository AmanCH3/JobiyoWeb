import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const { method, url, ip } = req;
  const user = req.user ? req.user._id : 'Guest';
  const requestId = req.requestId || 'no-id';

  // Log the request initiation
  logger.info(`Incoming Request: ${method} ${url} | User: ${user} | IP: ${ip} | ReqID: ${requestId}`);

  // Capture response finish to log status code
  res.on('finish', () => {
    const { statusCode } = res;
    if (statusCode >= 400) {
        logger.error(`Request Failed: ${method} ${url} | Status: ${statusCode} | User: ${user} | ReqID: ${requestId}`);
    } else {
        logger.info(`Request Completed: ${method} ${url} | Status: ${statusCode} | User: ${user} | ReqID: ${requestId}`);
    }
  });

  next();
};

export default requestLogger;
