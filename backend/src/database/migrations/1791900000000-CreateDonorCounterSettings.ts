import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDonorCounterSettings1791900000000 implements MigrationInterface {
  name = 'CreateDonorCounterSettings1791900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "donor_counter_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_donor_counter_settings" PRIMARY KEY ("id")
      )
    `);

    // Seed initial single settings row with 0
    await queryRunner.query(`
      INSERT INTO "donor_counter_settings" ("count")
      VALUES (0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "donor_counter_settings"`);
  }
}
