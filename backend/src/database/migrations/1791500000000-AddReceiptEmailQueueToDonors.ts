import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReceiptEmailQueueToDonors1791500000000 implements MigrationInterface {
    name = 'AddReceiptEmailQueueToDonors1791500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donors" ADD "receipt_email_status" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "donors" ADD "receipt_email_attempts" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "donors" ADD "receipt_email_next_attempt_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "donors" ADD "receipt_email_sent_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "donors" ADD "receipt_email_error" text`);
        await queryRunner.query(`CREATE INDEX "idx_donors_receipt_email_queue" ON "donors" ("receipt_email_status")`);
        // Donations paid before the queue existed already got their email
        await queryRunner.query(`UPDATE "donors" SET "receipt_email_status" = 'sent' WHERE "status" = 'paid' AND "email" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_donors_receipt_email_queue"`);
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "receipt_email_error"`);
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "receipt_email_sent_at"`);
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "receipt_email_next_attempt_at"`);
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "receipt_email_attempts"`);
        await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN "receipt_email_status"`);
    }
}
