
import rateLimit from 'express-rate-limit';
import FILE_CONSTANTS from 'shared/constants';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const max = Number(process.env.RATE_LIMIT_MAX ?? 100);

const globalRateLimiter = rateLimit({
  windowMs,
  limit: max,
  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => {
    const path = req.originalUrl.split('?')[0];

    return (
      path === '/v1/health' ||
      (req.method === 'POST' && path === '/v1/jobs/submit')
    );
  },

  message: {
    message: FILE_CONSTANTS.MESSAGES.COMMON.T00_MANY_REQUEST,
  },
});

export default globalRateLimiter;
