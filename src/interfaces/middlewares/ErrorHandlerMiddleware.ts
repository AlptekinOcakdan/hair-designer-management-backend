import { Request, Response, NextFunction } from "express";
import logger from "../logger/Logger";

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandlerMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  const stack = process.env.NODE_ENV !== "production" ? err.stack : {};

  logger.error(
    `
    Error: %s 
    | Stack: %s 
    | Request Method: %s 
    | Request URL: %s 
    | Request Params: %o 
    | Request Query: %o 
    | Request Body: %o`,
    message,
    err.stack,
    req.method,
    req.url,
    req.params,
    req.query,
    req.body
  );

  res.status(statusCode).json({ error: message, stack: stack });
};
