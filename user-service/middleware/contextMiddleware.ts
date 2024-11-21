import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories';

// Define the context object that will be available in the Express request object
export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.context = {
    userRepository: new UserRepository(),
  };

  next();
};
