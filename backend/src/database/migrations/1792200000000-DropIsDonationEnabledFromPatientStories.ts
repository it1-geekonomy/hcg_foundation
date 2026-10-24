import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropIsDonationEnabledFromPatientStories1792200000000 implements MigrationInterface {
  name = 'DropIsDonationEnabledFromPatientStories1792200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_stories" DROP COLUMN IF EXISTS "is_donation_enabled"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_stories" ADD "is_donation_enabled" boolean NOT NULL DEFAULT false`,
    );
  }
}
