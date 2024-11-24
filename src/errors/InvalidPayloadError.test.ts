import { InvalidPayloadError } from './InvalidPayloadError';

const zodErrors = [
  {
    code: 'custom' as const,
    message: 'All the emails must be unique',
    path: ['emails'],
  },
];

describe('InvalidPayloadError', () => {
  it('should create an instance of InvalidPayloadError', () => {
    const error = new InvalidPayloadError({
      message: 'Invalid payload',
      errors: zodErrors,
    });
    expect(error).toBeInstanceOf(InvalidPayloadError);
  });

  it('should have the correct message', () => {
    const message = 'Invalid payload';
    const error = new InvalidPayloadError({
      message: 'Invalid payload',
      errors: zodErrors,
    });
    expect(error.message).toBe(message);
  });

  it('should have the correct name', () => {
    const error = new InvalidPayloadError({
      message: 'Invalid payload',
      errors: zodErrors,
    });
    expect(error.name).toBe('InvalidPayloadError');
  });

  it('should have a stack trace', () => {
    const error = new InvalidPayloadError({
      message: 'Invalid payload',
      errors: zodErrors,
    });
    expect(error.stack).toBeDefined();
  });

  it('should use a default message if none is provided', () => {
    const error = new InvalidPayloadError({
      errors: zodErrors,
    });
    expect(error.message).toBe('Invalid payload');
  });
});
