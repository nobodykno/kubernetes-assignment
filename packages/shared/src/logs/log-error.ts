import { ILog } from "./log-dto.js";
import logger from "./logger.js";





/**
 *
 * @param payload
 * Log success
 */
const logError = (payload: ILog): void => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  logger.error(payload);
};

export default logError;
