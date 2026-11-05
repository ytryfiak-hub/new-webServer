import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

interface ErrorResponseBody {
  success: false;
  message: string;
  stack?: string;
}

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else {
    // Коди помилок PostgreSQL: https://www.postgresql.org/docs/current/errcodes-appendix.html
    const pgCode = (err as { code?: unknown }).code;
    if (pgCode === '23505') {
      statusCode = 409;
      message = 'Duplicate field value: resource already exists';
    } else if (typeof pgCode === 'string' && ['23502', '23514', '22P02', '22007', '22008'].includes(pgCode)) {
      statusCode = 400;
      message = `Invalid data: ${err.message}`;
    }
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  const body: ErrorResponseBody = {
    success: false,
    message,
  };

  if (env.nodeEnv === 'development') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
