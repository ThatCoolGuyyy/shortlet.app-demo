import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1713029630000 implements MigrationInterface {
  name = 'InitialSchema1713029630000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query("CREATE TYPE \"public\".\"users_role_enum\" AS ENUM('host','guest')");
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" text NOT NULL,
        "email" text NOT NULL,
        "password_hash" text NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'host',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "apartments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" text NOT NULL,
        "description" text NOT NULL,
        "location" text NOT NULL,
        "price_per_night" numeric(10,2) NOT NULL,
        "amenities" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "host_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_apartments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_apartments_host" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "apartment_id" uuid NOT NULL,
        "guest_id" uuid NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_apartment" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bookings_guest" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_bookings_date_range" CHECK ("start_date" < "end_date")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_apartments_location" ON "apartments" ("location")');
    await queryRunner.query('CREATE INDEX "IDX_apartments_price" ON "apartments" ("price_per_night")');
    await queryRunner.query('CREATE INDEX "IDX_bookings_apartment_dates" ON "bookings" ("apartment_id", "start_date", "end_date")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_bookings_apartment_dates"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_apartments_price"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_apartments_location"');
    await queryRunner.query('DROP TABLE IF EXISTS "bookings"');
    await queryRunner.query('DROP TABLE IF EXISTS "apartments"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."users_role_enum"');
  }
}
