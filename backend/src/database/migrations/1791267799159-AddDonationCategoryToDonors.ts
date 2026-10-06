import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDonationCategoryToDonors1791267799159 implements MigrationInterface {
    name = 'AddDonationCategoryToDonors1791267799159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."donation_category_enum" AS ENUM('Financial Assistance', 'Awareness & Prevention', 'Psychological Support', 'Research & Innovation', 'General Funds')`);
        await queryRunner.query(`ALTER TABLE "donors" ADD "donation_category" "public"."donation_category_enum" NOT NULL DEFAULT 'General Funds'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "donation_category"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."donation_category_enum"`);
    }

}
