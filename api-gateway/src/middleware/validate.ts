

import { ValidationSchema } from '@/dto/request/validation.js';
import { HttpError } from '@/lib/http-error.js';
import type { NextFunction, Request, Response } from 'express';
import FILE_CONSTANTS from 'shared/constants';

/**
 * Validates request body, params, query and headers.
 *
 * @param schema - validation schemas.
 * @returns Express middleware.
 */
const validate =
  (schema: ValidationSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
      const sections = ['body', 'params', 'query'] as const;

      for (const section of sections) {
        const validator = schema[section];

        if (!validator) {
          continue;
        }

        const result = validator.safeParse(req[section]);

        if (!result.success) {

          return next(
            new HttpError(FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST,result.error.issues.map((issue) => issue.message).join(', ')),
          );
        }

    
        if (section === 'query') {
          Object.assign(req.query, result.data);
        } else {
          req[section] = result.data;
        }
      }

      next();
    };

export default validate;
