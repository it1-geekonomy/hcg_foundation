import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignAnnualReportsForR21741234567930 implements MigrationInterface {
  name = 'AlignAnnualReportsForR21741234567930';

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
      CREATE TABLE IF NOT EXISTS annual_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        report_year VARCHAR(9),
        annual_report_banner TEXT,
        annual_report_file TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        schema_code TEXT,
        status content_status NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // If an older scaffold table exists, add missing R2/SEO columns safely
    await queryRunner.query(`
      ALTER TABLE annual_reports
        ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
        ADD COLUMN IF NOT EXISTS report_year VARCHAR(9),
        ADD COLUMN IF NOT EXISTS annual_report_banner TEXT,
        ADD COLUMN IF NOT EXISTS annual_report_file TEXT,
        ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS meta_description TEXT,
        ADD COLUMN IF NOT EXISTS schema_code TEXT
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'annual_reports' AND column_name = 'status'
        ) THEN
          ALTER TABLE annual_reports
            ADD COLUMN status content_status NOT NULL DEFAULT 'draft';
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_annual_reports_status ON annual_reports(status)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_annual_reports_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS annual_reports`);
  }
}
