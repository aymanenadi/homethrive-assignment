import { Request, Response, NextFunction } from 'express';
import { validateEmailUpdatesMiddleware } from './validateEmailUpdatesMiddleware';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { InvalidEmailDeletionError } from '../errors/InvalidEmailDeletionError';
import { toMockUser } from '../test-utils/mocks/user';

const fetchedUser = toMockUser();

let req: Request;
let res: MockResponse<Response<any, Record<string, any>>>;

describe('validateEmailUpdatesMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();

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

    await validateEmailUpdatesMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return an error if the user is trying to remove an email', async () => {
    req.body = {
      ...fetchedUser,
      emails: ['new.email@gmail.com'],
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const next = jest.fn() as NextFunction;

    await validateEmailUpdatesMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(InvalidEmailDeletionError));
  });
});
