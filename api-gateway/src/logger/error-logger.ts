import { ILog } from '@/dto/request/logs.js';
import logs from 'shared/logs';




/**
 * Return error log
 * @param payload
 */

const logError = (payload: ILog): void => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  logs.logError(payload);
};

export default logError;