import { NextFunction } from 'express';
import { errorHandlerMiddleware } from './errorHandlerMiddleware';
import { createRequest, createResponse } from 'node-mocks-http';
import { sendErrorResponse } from '../utils/httpResponses';

jest.mock('../utils/httpResponses');

describe('errorHandlerMiddleware', () => {
  it('should return the error response', () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    const error = {
      statusCode: 400,
      message: 'Bad Request',
      errors: ['Invalid email'],
    };

    errorHandlerMiddleware(error, req, res, next);

    expect(sendErrorResponse).toHaveBeenCalledWith({
      res,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
    });
  });
});
