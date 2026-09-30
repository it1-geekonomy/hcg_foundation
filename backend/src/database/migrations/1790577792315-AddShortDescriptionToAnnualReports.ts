import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShortDescriptionToAnnualReports1790577792315 implements MigrationInterface {
    name = 'AddShortDescriptionToAnnualReports1790577792315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "annual_reports" ADD "short_description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "annual_reports" DROP COLUMN "short_description"`);
    }

}
