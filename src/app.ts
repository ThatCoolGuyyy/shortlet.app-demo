import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import type { DataSource } from 'typeorm';
import { useDataSource } from './database';
import { createAuthRouter } from './routes/auth';
import { createApartmentRouter } from './routes/apartments';
import { AppError, ValidationError } from './utils/errors';

export function createApp(dataSource?: DataSource) {
  const app = express();

  if (dataSource) {
    useDataSource(dataSource);
  }

  // Trust proxy headers for rate limiting and client IP detection
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', createAuthRouter());
  app.use('/apartments', createApartmentRouter());

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      res.status(err.status).json({ message: err.message, details: err.details });
      return;
    }

    if (err instanceof AppError) {
      res.status(err.status).json({ message: err.message, details: err.details });
      return;
    }

    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
