import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSlugFromPatientTestimonials1741234568023 implements MigrationInterface {
  name = 'RemoveSlugFromPatientTestimonials1741234568023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patient_testimonials"
      DROP COLUMN "slug"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patient_testimonials"
      ADD COLUMN "slug" VARCHAR(255) NOT NULL
    `);
    
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_patient_testimonials_slug" ON "patient_testimonials" ("slug")
    `);
  }
}
