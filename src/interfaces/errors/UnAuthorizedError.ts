export class UnAuthorizedError extends Error {
    statusCode: number;
  
    constructor(message: string) {
      super(message);
      this.statusCode = 401;
      Object.setPrototypeOf(this, UnAuthorizedError.prototype);
    }
  }
  