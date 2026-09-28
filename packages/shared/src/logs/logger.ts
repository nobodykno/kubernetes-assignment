import fs from 'fs';
import path from 'path';

import winston from 'winston';

/**
 * Directory where application log files are stored.
 */
const logDirectory = path.join(process.cwd(), 'logs');

/**
 * Creates the log directory if it does not already exist.
 */

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

/**
 * Logger configuration setup
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',

  format: winston.format.combine(
    winston.format.timestamp(),

    winston.format.json(),
  ),

  transports: [
    new winston.transports.Console(),

    new winston.transports.File({
      filename: path.join(logDirectory, 'app.log'),
    }),

    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
  ],
});

export default logger;
