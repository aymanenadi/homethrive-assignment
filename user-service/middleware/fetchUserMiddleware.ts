import { Request, Response, NextFunction } from 'express';
import { UserNotFoundError } from '../errors/UserNotFoundError';

export const fetchUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = await req.context.userRepository.get(id);

  if (!user) {
    next(new UserNotFoundError());
    const error = new UserNotFoundError();
    return res.status(error.statusCode).json({ error: error.message });
  }

  req.context.fetchedUser = user;
  next();
};
