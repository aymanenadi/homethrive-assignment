import { Request, Response, NextFunction } from 'express';
import validateUpdateUserPayloadMiddleware from './validateUpdateUserPayloadMiddlware';
import { User } from '../repositories';
import { v4 as uuid } from 'uuid';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';

const fetchedUser: User = {
  id: uuid(),
  emails: ['test@gmail.com'],
  firstName: 'Test',
  lastName: 'User',
  dob: '1990-01-01',
};

let req: Request;
let res: MockResponse<Response<any, Record<string, any>>>;

describe('validateUpdateUserPayloadMiddleware', () => {
  beforeEach(() => {
    req = createRequest({
      params: { id: fetchedUser.id },
      context: {
        fetchedUser,
      },
    });
    res = createResponse();
  });

  it('should call next if the payload is valid', async () => {
    req.body = {
      emails: [fetchedUser.emails[0], 'test2@gmail.com'],
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const next = jest.fn() as NextFunction;

    await validateUpdateUserPayloadMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return an error if the payload is invalid', async () => {
    req.body = {
      emails: [fetchedUser.emails[0], 'invalid-email'],
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const next = jest.fn() as NextFunction;

    await validateUpdateUserPayloadMiddleware(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      errors: [
        {
          code: 'invalid_string',
          message: 'Invalid email format',
          path: ['emails', 1],
          validation: 'email',
        },
      ],
    });
  });

  it('should return an error if the user is trying to remove an email', async () => {
    req.body = {
      emails: ['new.email@gmail.com'],
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const next = jest.fn() as NextFunction;

    await validateUpdateUserPayloadMiddleware(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: 'Deleting an email is not allowed',
    });
  });
});
