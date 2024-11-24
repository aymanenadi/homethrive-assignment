import { UserAlreadyExistsError } from './UserAlreadyExistsError';

describe('UserAlreadyExistsError', () => {
  it('should create an error with default message and status code', () => {
    const error = new UserAlreadyExistsError();
    expect(error.message).toBe('A user with the same id already exists');
    expect(error.name).toBe('UserAlreadyExists');
    expect(error.statusCode).toBe(400);
  });

  it('should create an error with a custom message', () => {
    const customMessage = 'Custom error message';
    const error = new UserAlreadyExistsError(customMessage);
    expect(error.message).toBe(customMessage);
    expect(error.name).toBe('UserAlreadyExists');
    expect(error.statusCode).toBe(400);
  });

  it('should be an instance of Error', () => {
    const error = new UserAlreadyExistsError();
    expect(error).toBeInstanceOf(Error);
  });

  it('should have a stack trace', () => {
    const error = new UserAlreadyExistsError();
    expect(error.stack).toBeDefined();
  });
});
