import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 1. Creates the `team_type` enum ('team' | 'trustee').
 * 2. Adds `type` column to `teams` (defaults to 'team').
 * 3. Drops `short_description` column from `teams`.
 */
export class AddTeamTypeAndDropShortDescription1741234568038
  implements MigrationInterface
{
  name = 'AddTeamTypeAndDropShortDescription1741234568038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type if not already there
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE team_type AS ENUM ('team', 'trustee');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Add the type column defaulting to 'team' for existing rows
    await queryRunner.query(`
      ALTER TABLE teams
        ADD COLUMN IF NOT EXISTS type team_type NOT NULL DEFAULT 'team';
    `);

    // Drop short_description from teams
    await queryRunner.query(`
      ALTER TABLE teams
        DROP COLUMN IF EXISTS short_description;
    `);

    // Add index on type for fast filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_type ON teams (type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_type;`);

    await queryRunner.query(`
      ALTER TABLE teams
        ADD COLUMN IF NOT EXISTS short_description text;
    `);

    await queryRunner.query(`
      ALTER TABLE teams
        DROP COLUMN IF EXISTS type;
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS team_type;`);
  }
}
