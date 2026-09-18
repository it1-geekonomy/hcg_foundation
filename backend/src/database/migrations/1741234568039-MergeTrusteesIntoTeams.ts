import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 1. Migrates all rows from `trustees` → `teams` with type = 'trustee'.
 * 2. Drops the `trustees` table.
 */
export class MergeTrusteesIntoTeams1741234568039
  implements MigrationInterface
{
  name = 'MergeTrusteesIntoTeams1741234568039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Guard: only run if the trustees table still exists
    const [{ table_exists }] = await queryRunner.query(
      `SELECT to_regclass('public.trustees') AS table_exists`,
    );

    if (!table_exists) {
      console.log('trustees table not found – skipping data migration.');
      return;
    }

    // Copy all trustee rows into teams with type = 'trustee'
    await queryRunner.query(`
      INSERT INTO teams (
        id,
        created_at,
        updated_at,
        deleted_at,
        meta_title,
        meta_description,
        schema_code,
        title,
        designation,
        team_image,
        content,
        type,
        status
      )
      SELECT
        id,
        created_at,
        updated_at,
        deleted_at,
        meta_title,
        meta_description,
        schema_code,
        title,
        designation,
        trustee_image,
        content,
        'trustee'::team_type,
        status
      FROM trustees;
    `);

    // Drop the now-redundant trustees table
    await queryRunner.query(`DROP TABLE IF EXISTS trustees;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the trustees table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS trustees (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        created_at timestamp without time zone NOT NULL DEFAULT now(),
        updated_at timestamp without time zone NOT NULL DEFAULT now(),
        deleted_at timestamp without time zone,
        meta_title character varying(255),
        meta_description character varying,
        schema_code character varying,
        title character varying(255) NOT NULL,
        designation character varying(255),
        trustee_image text,
        content text,
        status content_status NOT NULL DEFAULT 'draft'::content_status,
        CONSTRAINT "PK_trustees" PRIMARY KEY (id)
      );
    `);

    // Move trustee rows back
    await queryRunner.query(`
      INSERT INTO trustees (
        id,
        created_at,
        updated_at,
        deleted_at,
        meta_title,
        meta_description,
        schema_code,
        title,
        designation,
        trustee_image,
        content,
        status
      )
      SELECT
        id,
        created_at,
        updated_at,
        deleted_at,
        meta_title,
        meta_description,
        schema_code,
        title,
        designation,
        team_image,
        content,
        status
      FROM teams
      WHERE type = 'trustee';
    `);

    // Remove those rows from teams
    await queryRunner.query(`DELETE FROM teams WHERE type = 'trustee';`);
  }
}
