import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisplayOrderToTeams1791175388240 implements MigrationInterface {
    name = 'AddDisplayOrderToTeams1791175388240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" ADD "display_order" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`CREATE INDEX "idx_teams_display_order" ON "teams" ("display_order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_teams_display_order"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "display_order"`);
    }
}
