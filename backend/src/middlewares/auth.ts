import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

interface JwtPayload {
  _id: string;
}

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as JwtPayload;
    (req as any).user = payload;
    return next();
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default authMiddleware;
