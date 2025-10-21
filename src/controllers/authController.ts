import type { Request, Response } from 'express';
import { LoginDto, RegisterDto } from '../dto/AuthDto';
import { userService } from '../services/userService';
import { signToken } from '../utils/jwt';
import { validateDto } from '../utils/validation';

class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const payload = await validateDto(RegisterDto, req.body);
    const user = await userService.registerUser(payload);
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({ user, token });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const payload = await validateDto(LoginDto, req.body);
    const user = await userService.authenticateUser(payload);
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(200).json({ user, token });
  };
}

export const authController = new AuthController();
