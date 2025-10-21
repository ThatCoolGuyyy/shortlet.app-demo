import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('Authorization');
  if (!header) {
    return next(new UnauthorizedError('Authorization header missing'));
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Invalid authorization header format'));
  }

  req.user = verifyToken(token);
  return next();
}
