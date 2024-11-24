import { InvalidEmailDeletionError } from './InvalidEmailDeletionError';

describe('EmailDeletionError', () => {
  it('should create an instance of EmailDeletionError', () => {
    const error = new InvalidEmailDeletionError('Test error message');
    expect(error).toBeInstanceOf(InvalidEmailDeletionError);
    expect(error.message).toBe('Test error message');
  });

  it('should have a default message if none is provided', () => {
    const error = new InvalidEmailDeletionError();
    expect(error.message).toBe('Deleting an email address is not allowed');
  });

  it('should set the correct name', () => {
    const error = new InvalidEmailDeletionError('Test error message');
    expect(error.name).toBe('InvalidEmailDeletionError');
  });
});
