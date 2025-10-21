import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: string;
}

const env = process.env;

export const config: AppConfig = {
  port: Number(env.PORT ?? 3000),
  databaseUrl: env.DATABASE_URL ?? '',
  jwtSecret: env.JWT_SECRET ?? 'insecure-development-secret',
  nodeEnv: env.NODE_ENV ?? 'development'
};

export function assertRuntimeConfig(): void {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL environment variable must be provided');
  }
  if (!env.JWT_SECRET && config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be provided in production');
  }
}
