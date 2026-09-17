import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisplayOrderToProjects1741234568031 implements MigrationInterface {
  name = 'AddDisplayOrderToProjects1741234568031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 1
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_projects_display_order"
      ON "projects" ("display_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_projects_display_order"
    `);

    await queryRunner.query(`
      ALTER TABLE "projects"
      DROP COLUMN "display_order"
    `);
  }
}
