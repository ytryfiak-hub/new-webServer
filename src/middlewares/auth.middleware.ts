import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  // 1. Перевірка наявності заголовка Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization header with Bearer token is required'));
  }

  // 2. Витягуємо чистий токен
  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_ACCESS_SECRET || 'your_default_access_secret';
    
    // 3. Перевірка та розшифровка JWT
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // 4. Записуємо userId у запит
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
};