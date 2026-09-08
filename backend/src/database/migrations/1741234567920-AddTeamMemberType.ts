import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamMemberType1741234567920 implements MigrationInterface {
  name = 'AddTeamMemberType1741234567920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_type') THEN
          CREATE TYPE team_member_type AS ENUM ('trustee', 'team');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE teams
      ADD COLUMN IF NOT EXISTS member_type team_member_type NOT NULL DEFAULT 'trustee'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_member_type ON teams(member_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_member_type`);
    await queryRunner.query(
      `ALTER TABLE teams DROP COLUMN IF EXISTS member_type`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS team_member_type`);
  }
}
