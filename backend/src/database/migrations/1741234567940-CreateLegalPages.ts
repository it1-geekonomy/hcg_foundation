import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLegalPages1741234567940 implements MigrationInterface {
  name = 'CreateLegalPages1741234567940';

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
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'legal_page_type') THEN
          CREATE TYPE legal_page_type AS ENUM ('privacy_policy', 'terms_and_conditions');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS legal_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT,
        page_type legal_page_type NOT NULL,
        status content_status NOT NULL DEFAULT 'draft',
        meta_title VARCHAR(255),
        meta_description TEXT,
        schema_code TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_legal_pages_page_type ON legal_pages(page_type)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_legal_pages_status ON legal_pages(status)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_legal_pages_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_legal_pages_page_type`);
    await queryRunner.query(`DROP TABLE IF EXISTS legal_pages`);
    await queryRunner.query(`DROP TYPE IF EXISTS legal_page_type`);
  }
}
