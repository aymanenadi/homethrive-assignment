/**
 * Error thrown when a user is not found
 */
export class UserNotFoundError extends Error {
  statusCode: number;

  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
    this.statusCode = 404;
  }
}
