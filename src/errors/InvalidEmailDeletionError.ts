export class InvalidEmailDeletionError extends Error {
  statusCode: number;

  constructor(message: string = 'Deleting an email address is not allowed') {
    super(message);
    this.name = 'InvalidEmailDeletionError';
    this.statusCode = 400;
  }
}
