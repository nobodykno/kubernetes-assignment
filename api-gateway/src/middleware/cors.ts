import FILE_CONSTANTS from 'shared/constants';


import type cors from 'cors';
import { HttpError } from '@/lib/http-error.js';
import logError from '@/logger/error-logger.js';

/**
 * Checks all allowedOrigins
 */
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? [];
const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow Postman and server-to-server requests
    if (!origin) {
      return callback(null, true);
    }



    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logError({
      module: FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
      action: FILE_CONSTANTS.MESSAGES.ACTION.CORS,
      message: FILE_CONSTANTS.MESSAGES.CORS.CORS_ERROR,
    });

    callback(
      new HttpError(FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST,FILE_CONSTANTS.MESSAGES.CORS.CORS_ERROR),
    );
  },

  credentials: true,
};

export default corsOptions;
