import { Response } from 'express';

/**
 * Sends a success response with the provided data and status code
 * @param param0
 * @returns
 */
export const sendSuccessResponse = ({
  res,
  statusCode,
  data,
}: {
  res: Response;
  statusCode: number;
  data?: any;
}) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
  });
};

export const sendErrorResponse = ({
  res,
  statusCode = 500,
  message,
  errors,
}: {
  res: Response;
  statusCode: number;
  message: string;
  errors?: any;
}) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errors,
  });
};
