import { Request, Response, NextFunction } from 'express';
import { UserSchema } from '../types/user';
import { InvalidPayloadError } from '../errors/InvalidPayloadError';

/**
 * Function that returns a middleware to validate the request against the UserSchema.
 * @param keysToOmit : Optional array of keys from the schema to make optional.
 * @returns
 */
export const validatePayloadMiddleware =
  (optionalKeys: string[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const mask = optionalKeys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    const Schema = UserSchema.partial(mask);
    const { success, error, data } = Schema.safeParse(req.body);
    if (!success) {
      next(new InvalidPayloadError({ errors: error.errors }));
    }
    // Replace the request body with the validated data.
    // Additional keys are stipped out.
    // This is useful for routes that depend on the validated data.
    req.body = data;
    next();
  };
