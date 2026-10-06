import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeHomeBannerNameOptional1791400000000 implements MigrationInterface {
    name = 'MakeHomeBannerNameOptional1791400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "home_banners" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "home_banners" SET "name" = "title" WHERE "name" IS NULL`);
        await queryRunner.query(`ALTER TABLE "home_banners" ALTER COLUMN "name" SET NOT NULL`);
    }
}
