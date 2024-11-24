import { NextFunction } from 'express';
import { contextMiddleware } from './contextMiddleware';
import { UserRepository } from '../repositories';
import { createRequest, createResponse } from 'node-mocks-http';

describe('contextMiddleware', () => {
  it('should add userRepository to req.context and calls next', () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    contextMiddleware(req, res, next);

    expect(req.context).toBeDefined();
    expect(req.context.userRepository).toBeInstanceOf(UserRepository);
    expect(next).toHaveBeenCalled();
  });
});
