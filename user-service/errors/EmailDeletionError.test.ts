import { EmailDeletionError } from './EmailDeletionError';

describe('EmailDeletionError', () => {
  it('should create an instance of EmailDeletionError', () => {
    const error = new EmailDeletionError('Test error message');
    expect(error).toBeInstanceOf(EmailDeletionError);
    expect(error.message).toBe('Test error message');
  });

  it('should have a default message if none is provided', () => {
    const error = new EmailDeletionError();
    expect(error.message).toBe('Deleting an email is not allowed');
  });

  it('should set the correct name', () => {
    const error = new EmailDeletionError('Test error message');
    expect(error.name).toBe('EmailDeletionError');
  });
});
