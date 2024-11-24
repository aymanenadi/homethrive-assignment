import { fetchUserMiddleware } from './fetchUserMiddleware';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { createRequest, createResponse } from 'node-mocks-http';

const request = createRequest({
  params: { id: '123' },
  context: {
    userRepository: {
      get: jest.fn().mockResolvedValue({ id: '123', name: 'Alice' }),
    },
  },
});

const response = createResponse();

describe('fetchUserMiddleware', () => {
  it('should add fetchedUser to req.context and calls next', async () => {
    const next = jest.fn();

    await fetchUserMiddleware(request, response, next);

    expect(request.context.fetchedUser).toEqual({ id: '123', name: 'Alice' });
    expect(next).toHaveBeenCalled();
  });

  it('should call next with UserNotFoundError if user is not found', async () => {
    const next = jest.fn();
    request.context.userRepository.get = jest.fn().mockResolvedValue(null);

    await fetchUserMiddleware(request, response, next);

    expect(next).toHaveBeenCalledWith(new UserNotFoundError());
  });

  it('should call next with an error if userRepository.get throws an error', async () => {
    const next = jest.fn();
    request.context.userRepository.get = jest
      .fn()
      .mockRejectedValue(new Error());

    await fetchUserMiddleware(request, response, next);

    expect(next).toHaveBeenCalledWith(new Error());
  });
});
