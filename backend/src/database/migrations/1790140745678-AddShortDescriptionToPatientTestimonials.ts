import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShortDescriptionToPatientTestimonials1790140745678 implements MigrationInterface {
    name = 'AddShortDescriptionToPatientTestimonials1790140745678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_testimonials" ADD "short_description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_testimonials" DROP COLUMN "short_description"`);
    }
}
