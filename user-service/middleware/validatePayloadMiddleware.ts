import { Request, Response, NextFunction } from 'express';
import { UserSchema } from '../types/user';
import { InvalidPayloadError } from '../errors/InvalidPayloadError';

/**
 * Function that returns a middleware to validate the request against the UserSchema.
 * @param keysToOmit : Optional array of keys to omit from the schema.
 * @returns
 */
export const validatePayloadMiddleware =
  (keysToOmit: string[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const mask = keysToOmit.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    const Schema = UserSchema.omit(mask);
    const { success, error } = Schema.safeParse(req.body);
    if (!success) {
      next(new InvalidPayloadError({ errors: error.errors }));
    }
    next();
  };
