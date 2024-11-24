import { RouteNotFoundError } from './RouteNotFoundError';

describe('RouteNotFoundError', () => {
  it('should have a default message', () => {
    const error = new RouteNotFoundError();
    expect(error.message).toBe('Route not found');
  });

  it('should allow a custom message', () => {
    const customMessage = 'Custom route not found message';
    const error = new RouteNotFoundError(customMessage);
    expect(error.message).toBe(customMessage);
  });

  it('should have a name of "RouteNotFoundError"', () => {
    const error = new RouteNotFoundError();
    expect(error.name).toBe('RouteNotFoundError');
  });

  it('should have a statusCode of 404', () => {
    const error = new RouteNotFoundError();
    expect(error.statusCode).toBe(404);
  });

  it('should be an instance of Error', () => {
    const error = new RouteNotFoundError();
    expect(error).toBeInstanceOf(Error);
  });
});
