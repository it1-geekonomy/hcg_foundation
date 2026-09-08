import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES = [
  'teams',
  'trustees',
  'awards',
  'annual_reports',
  'publications',
  'newsletters',
  'gallery',
  'articles',
  'blogs',
  'projects',
  'events',
  'patient_stories',
  'donors',
  'leads_contact',
] as const;

export class AddSeoMetaFieldsToContentTables1741234567900
  implements MigrationInterface
{
  name = 'AddSeoMetaFieldsToContentTables1741234567900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(`
        ALTER TABLE IF EXISTS "${table}"
          ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
          ADD COLUMN IF NOT EXISTS meta_description TEXT,
          ADD COLUMN IF NOT EXISTS schema_code TEXT
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(`
        ALTER TABLE IF EXISTS "${table}"
          DROP COLUMN IF EXISTS meta_title,
          DROP COLUMN IF EXISTS meta_description,
          DROP COLUMN IF EXISTS schema_code
      `);
    }
  }
}
