import { ILog } from "./log-dto.js";
import logger from "./logger.js";





/**
 *
 * @param payload
 * Log success
 */
const logSuccess = (payload: ILog): void => {
  // if (process.env.NODE_ENV !== 'production') {
  //   return;
  // }

  logger.info(payload);
};

export default logSuccess;
