export class RouteNotFoundError extends Error {
  statusCode: number;

  constructor(message: string = 'Route not found') {
    super(message);
    this.name = 'RouteNotFoundError';
    this.statusCode = 404;
  }
}
