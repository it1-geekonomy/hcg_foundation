import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1741234567910 implements MigrationInterface {
  name = 'CreateUsersTable1741234567910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        reset_string TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_username`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
