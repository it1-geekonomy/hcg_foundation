import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsDonationEnabledToPatientStories1791600000000 implements MigrationInterface {
  name = 'AddIsDonationEnabledToPatientStories1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_stories" ADD "is_donation_enabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_stories" DROP COLUMN "is_donation_enabled"`,
    );
  }
}
