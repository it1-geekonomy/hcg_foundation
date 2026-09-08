import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsAndContentStatus1741234567890
  implements MigrationInterface
{
  name = 'CreateTeamsAndContentStatus1741234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
          CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        team_image TEXT,
        content TEXT,
        short_description TEXT,
        status content_status NOT NULL DEFAULT 'draft',
        meta_title VARCHAR(255),
        meta_description TEXT,
        schema_code TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS teams`);
    await queryRunner.query(`DROP TYPE IF EXISTS content_status`);
  }
}
