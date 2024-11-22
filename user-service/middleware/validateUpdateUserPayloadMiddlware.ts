import { Request, Response, NextFunction } from 'express';

import { UserSchema } from '../repositories/UserRepository';
import { InvalidEmailDeletionError } from '../errors/InvalidEmailDeletionError';

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
    // Parse the payload to a partial of UserSchema and validate it
    const partialUserSchema = UserSchema.partial();
    const parsedPayload = partialUserSchema.parse(req.body);

    const fetchedUser = req.context.fetchedUser;

    // Check if the user is trying to remove an email
    if (parsedPayload.emails && fetchedUser) {
      const newEmailsSet = new Set(parsedPayload.emails);

      const allExistingEmailsArePresent = fetchedUser.emails.every((email) => {
        return newEmailsSet.has(email);
      });

      if (!allExistingEmailsArePresent) {
        const error = new InvalidEmailDeletionError();
        return res.status(error.statusCode).json({ error: error.message });
      }
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle validation errors
    return res.status(400).json({ errors: error.errors });
  }
};

export default validateUpdateUserPayloadMiddleware;
