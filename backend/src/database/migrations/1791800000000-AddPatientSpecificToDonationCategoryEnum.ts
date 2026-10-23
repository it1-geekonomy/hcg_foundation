import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientSpecificToDonationCategoryEnum1791800000000 implements MigrationInterface {
  name = 'AddPatientSpecificToDonationCategoryEnum1791800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."donation_category_enum" ADD VALUE IF NOT EXISTS 'Patient Specific'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing values from an enum without dropping/recreating it.
    // Leaving the enum value in place on down is standard and safe.
  }
}
