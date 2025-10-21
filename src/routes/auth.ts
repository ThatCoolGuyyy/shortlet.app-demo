import { Router } from 'express';
import { authController } from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';

export function createAuthRouter(): Router {
  const router = Router();

  router.post('/register', asyncHandler(authController.register));

  router.post('/login', asyncHandler(authController.login));

  return router;
}
