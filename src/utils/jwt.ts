import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from './errors';

export interface TokenPayload {
  sub: string;
  email: string;
  role: 'host' | 'guest';
  name: string;
}

export function signToken(
  payload: TokenPayload,
  expiresIn: SignOptions['expiresIn'] = '2h'
): string {
  const secret: Secret = config.jwtSecret;
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const secret: Secret = config.jwtSecret;
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') {
      throw new UnauthorizedError('Invalid token payload');
    }
    return decoded as TokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
