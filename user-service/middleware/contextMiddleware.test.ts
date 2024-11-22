import { Request, Response, NextFunction } from 'express';
import { contextMiddleware } from './contextMiddleware';
import { UserRepository } from '../repositories';

describe('contextMiddleware', () => {
  it('should add userRepository to req.context and calls next', () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    contextMiddleware(req, res, next);

    expect(req.context).toBeDefined();
    expect(req.context.userRepository).toBeInstanceOf(UserRepository);
    expect(next).toHaveBeenCalled();
  });
});
