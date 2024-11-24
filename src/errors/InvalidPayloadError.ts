import { ZodIssue } from 'zod';

/**
 * Error thrown when the payload is invalid
 */
export class InvalidPayloadError extends Error {
  statusCode: number;
  errors: ZodIssue[];
  constructor({
    errors,
    message = 'Invalid payload',
  }: {
    errors: ZodIssue[];
    message?: string;
  }) {
    super(message);
    this.name = 'InvalidPayloadError';
    this.statusCode = 400;
    this.errors = errors;
  }
}
