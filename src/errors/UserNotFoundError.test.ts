import { UserNotFoundError } from './UserNotFoundError';

describe('UserNotFoundError', () => {
  it('should have the correct name', () => {
    const error = new UserNotFoundError();
    expect(error.name).toBe('UserNotFoundError');
  });

  it('should have the correct default message', () => {
    const error = new UserNotFoundError();
    expect(error.message).toBe('User not found');
  });

  it('should allow a custom message', () => {
    const customMessage = 'Custom error message';
    const error = new UserNotFoundError(customMessage);
    expect(error.message).toBe(customMessage);
  });

  it('should have a statusCode of 404', () => {
    const error = new UserNotFoundError();
    expect(error.statusCode).toBe(404);
  });

  it('should be an instance of Error', () => {
    const error = new UserNotFoundError();
    expect(error).toBeInstanceOf(Error);
  });
});
