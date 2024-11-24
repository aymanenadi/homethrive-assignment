import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/httpResponses';

export const errorHandlerMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return sendErrorResponse({
    res,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
  });
};
