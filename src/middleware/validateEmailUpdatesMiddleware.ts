import { Request, Response, NextFunction } from 'express';
import { InvalidEmailDeletionError } from '../errors/InvalidEmailDeletionError';
import { UserNotFoundError } from '../errors/UserNotFoundError';

/**
 * Validates the following business requirements before updating a user
 * 1- A user cannot have more than 3 emails
 * 2- A user cannot remove an email address, only add new ones
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const validateEmailUpdatesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fetchedUser = req.context.fetchedUser;
    if (!fetchedUser) {
      throw new UserNotFoundError();
    }

    // Check if the user is trying to remove an email
    const newEmailsSet = new Set(req.body.emails);

    const allExistingEmailsArePresent = fetchedUser.emails.every((email) => {
      return newEmailsSet.has(email);
    });

    if (!allExistingEmailsArePresent) {
      throw new InvalidEmailDeletionError();
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    next(error);
  }
};
