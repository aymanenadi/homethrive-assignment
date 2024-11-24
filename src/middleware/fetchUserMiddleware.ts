import { Request, Response, NextFunction } from 'express';
import { UserNotFoundError } from '../errors/UserNotFoundError';

export const fetchUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await req.context.userRepository.get(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    req.context.fetchedUser = user;
    next();
  } catch (error) {
    next(error);
  }
};
