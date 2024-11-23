import { Request, Response, NextFunction } from 'express';
import validateUpdateUserPayloadMiddleware from './validateUpdateUserPayloadMiddlware';
import { User } from '../types/user';
import { v4 as uuid } from 'uuid';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { InvalidPayloadError } from '../errors/InvalidPayloadError';
import { InvalidEmailDeletionError } from '../errors/InvalidEmailDeletionError';

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
      ...fetchedUser,
      firstName: 'new first name',
    };

    const next = jest.fn() as NextFunction;

    await validateUpdateUserPayloadMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return an error if the payload is invalid', async () => {
    req.body = {
      ...fetchedUser,
      emails: [fetchedUser.emails[0], 'invalid-email'],
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const next = jest.fn() as NextFunction;

    await validateUpdateUserPayloadMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(InvalidPayloadError));
  });

  it('should return an error if the user is trying to remove an email', async () => {
    req.body = {
      ...fetchedUser,
      emails: ['new.email@gmail.com'],
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const next = jest.fn() as NextFunction;

    await validateUpdateUserPayloadMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(InvalidEmailDeletionError));
  });
});
