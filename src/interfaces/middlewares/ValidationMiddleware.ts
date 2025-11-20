import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/BadRequestError';
import validator from 'validator';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { LoginUserDto } from '../dtos/LoginUserDto';

export const validateUserRegister = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  const createUserDto = new CreateUserDto(username, email, password);

  if (!createUserDto.username || !createUserDto.email || !createUserDto.password) {
    throw new BadRequestError('Missing required fields: username, email, password');
  }

  if (!validator.isEmail(createUserDto.email)) {
    throw new BadRequestError('Invalid email format');
  }

  if (!validator.isLength(createUserDto.password, { min: 6 })) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }

  if (!validator.isAlphanumeric(createUserDto.username)) {
    throw new BadRequestError('Username must be alphanumeric');
  }

  next();
};

export const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const loginUserDto = new LoginUserDto(email, password);

  if (!loginUserDto.email || !loginUserDto.password) {
    throw new BadRequestError('Missing required fields: username, email, password');
  }

  if (!validator.isEmail(loginUserDto.email)) {
    throw new BadRequestError('Invalid email format');
  }

  if (!validator.isLength(loginUserDto.password, { min: 6 })) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }

  next();
};
