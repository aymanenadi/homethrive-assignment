import { Request, Response, NextFunction } from 'express';

import { InvalidEmailDeletionError } from '../errors/InvalidEmailDeletionError';
import { InvalidPayloadError } from '../errors/InvalidPayloadError';
import { UserSchema } from '../types/user';
import { sendErrorResponse } from '../utils/httpResponses';

/**
 * Validates the following business requirements before updating a user
 * 1- A user cannot have more than 3 emails
 * 2- A user cannot remove an email address, only add new ones
 * @param req
 * @param res
 * @param next
 * @returns
 */
const validateUpdateUserPayloadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the payload
    const { success, data: payload, error } = UserSchema.safeParse(req.body);

    if (!success) {
      throw new InvalidPayloadError({ errors: error.errors });
    }

    const fetchedUser = req.context.fetchedUser;

    // Check if the user is trying to remove an email
    if (payload.emails && fetchedUser) {
      const newEmailsSet = new Set(payload.emails);

      const allExistingEmailsArePresent = fetchedUser.emails.every((email) => {
        return newEmailsSet.has(email);
      });

      if (!allExistingEmailsArePresent) {
        throw new InvalidEmailDeletionError();
      }
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle validation errors
    next(error);
  }
};

export default validateUpdateUserPayloadMiddleware;
