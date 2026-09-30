import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNewsTable1741234568000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "news" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-creation would require knowing the original schema
    // This is intentionally left empty as the news module is being removed
  }
}
