import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDonationCategoryToDonors1791267799159 implements MigrationInterface {
    name = 'AddDonationCategoryToDonors1791267799159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donors" ADD "donation_category" character varying(255) NOT NULL DEFAULT 'General Funds'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "donation_category"`);
    }

}
