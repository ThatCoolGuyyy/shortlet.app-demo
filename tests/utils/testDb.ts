import { DataType, newDb } from 'pg-mem';
import { v4 as uuid } from 'uuid';
import type { DataSource } from 'typeorm';
import path from 'path';
import { useDataSource } from '../../src/database';

export async function createTestDataSource(): Promise<{ dataSource: DataSource }> {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.registerExtension('uuid-ossp', schema => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: () => uuid(),
      impure: true
    });
  });

  db.public.registerFunction({
    name: 'now',
    returns: DataType.timestamp,
    implementation: () => new Date(),
    impure: true
  });

  db.public.registerFunction({
    name: 'version',
    returns: DataType.text,
    implementation: () => 'PostgreSQL 14.5 (pg-mem)'
  });

  db.public.registerFunction({
    name: 'current_database',
    returns: DataType.text,
    implementation: () => 'pg_mem'
  });

  const dataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [path.join(__dirname, '../../src/database/entities', '**', '*.{ts,js}')],
    migrations: [path.join(__dirname, '../../src/database/migrations', '**', '*.{ts,js}')],
    logging: false
  });

  await dataSource.initialize();
  await dataSource.runMigrations();
  useDataSource(dataSource);

  return { dataSource };
}
