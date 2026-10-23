import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientStoryIdToDonors1791700000000 implements MigrationInterface {
  name = 'AddPatientStoryIdToDonors1791700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "donors" ADD "patient_story_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "donors" ADD CONSTRAINT "FK_donors_patient_story_id" FOREIGN KEY ("patient_story_id") REFERENCES "patient_stories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donors_patient_story_id" ON "donors" ("patient_story_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_donors_patient_story_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "donors" DROP CONSTRAINT IF EXISTS "FK_donors_patient_story_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "donors" DROP COLUMN "patient_story_id"`,
    );
  }
}
