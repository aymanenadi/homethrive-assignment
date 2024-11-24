import { NextFunction } from 'express';
import { InvalidPayloadError } from '../errors/InvalidPayloadError';
import { validatePayloadMiddleware } from './validatePayloadMiddleware';
import { createRequest, createResponse } from 'node-mocks-http';
import { toMockUser } from '../test-utils/mocks/user';

describe('validatePayloadMiddleware', () => {
  const mockUser = toMockUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if the payload is valid', () => {
    const req = createRequest({ body: mockUser });
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    const middleware = validatePayloadMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return an error if the payload is invalid', () => {
    const req = createRequest({
      body: { ...mockUser, emails: ['invalid email'] },
    });
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    const middleware = validatePayloadMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(InvalidPayloadError));
  });

  it('should supporting omitting fields from the User schema', () => {
    const req = createRequest({
      body: { ...mockUser, id: undefined },
    });
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    const middleware = validatePayloadMiddleware(['id']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });
});
