/**
 * Error thrown when trying to create a user with an ID that already exists in the database.
 */
export class UserAlreadyExistsError extends Error {
  statusCode: number;

  constructor(message: string = 'A user with the same id already exists') {
    super(message);
    this.name = 'UserAlreadyExists';
    this.statusCode = 400;
  }
}
