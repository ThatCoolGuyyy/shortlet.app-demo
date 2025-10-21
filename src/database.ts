import 'reflect-metadata';
import path from 'path';
import { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from './config';
import { seedDatabase } from './database/seed';

export type AppDataSource = DataSource;

let activeDataSource: DataSource | null = null;

export function createDataSource(): DataSource {
  console.log('Creating DataSource with DATABASE_URL');
  
  const connectionOptions: PostgresConnectionOptions = {
    type: 'postgres',
    url: config.databaseUrl,
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, 'database/entities', '**', '*.{ts,js}')],
    migrations: [path.join(__dirname, 'database/migrations', '**', '*.{ts,js}')],
    ssl: {
      rejectUnauthorized: false
    },
    extra: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  };

  return new DataSource(connectionOptions);
}

export async function initializeDataSource(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  await dataSource.runMigrations();
  if (config.nodeEnv !== 'test') {
    await seedDatabase(dataSource);
  }
  useDataSource(dataSource);
}

export function useDataSource(dataSource: DataSource): void {
  activeDataSource = dataSource;
}

export function getDataSource(): DataSource {
  if (!activeDataSource) {
    throw new Error('Data source has not been initialized');
  }
  return activeDataSource;
}
