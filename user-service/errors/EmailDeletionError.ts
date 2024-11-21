export class EmailDeletionError extends Error {
  statusCode: number;

  constructor(message: string = 'Deleting an email is not allowed') {
    super(message);
    this.name = 'EmailDeletionError';
    this.statusCode = 400;
  }
}
