import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCvToLeadsInternship1789965597027 implements MigrationInterface {
    name = 'AddCvToLeadsInternship1789965597027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads_internship" ADD "cv" character varying(255) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads_internship" DROP COLUMN "cv"`);
    }

}
