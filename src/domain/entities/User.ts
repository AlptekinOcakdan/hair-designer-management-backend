export class User {
    constructor(
      public id: string,
      public username: string,
      public email: string,
      public password: string,
      public refreshToken: string,
      public createdAt: Date,
    ) {}
  }