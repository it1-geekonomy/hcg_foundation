import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSlugFromTrustees1741234568022 implements MigrationInterface {
  name = 'RemoveSlugFromTrustees1741234568022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trustees" DROP COLUMN "slug"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trustees" ADD COLUMN "slug" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "trustees" ADD CONSTRAINT "UQ_trustees_slug" UNIQUE ("slug")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_trustees_slug" ON "trustees" ("slug")`);
  }
}
