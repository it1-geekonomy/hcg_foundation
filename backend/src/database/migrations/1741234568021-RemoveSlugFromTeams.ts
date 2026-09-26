import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSlugFromTeams1741234568021 implements MigrationInterface {
  name = 'RemoveSlugFromTeams1741234568021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "slug"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "teams" ADD COLUMN "slug" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "UQ_teams_slug" UNIQUE ("slug")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_teams_slug" ON "teams" ("slug")`);
  }
}
