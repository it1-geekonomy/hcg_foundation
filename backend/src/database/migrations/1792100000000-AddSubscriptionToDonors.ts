import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionToDonors1792100000000 implements MigrationInterface {
  name = 'AddSubscriptionToDonors1792100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donors" ADD "subscription_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "donors" ADD "razorpay_subscription_id" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donors_subscription_id" ON "donors" ("subscription_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donors_razorpay_subscription_id" ON "donors" ("razorpay_subscription_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "donors"
      ADD CONSTRAINT "FK_donors_subscription_id"
      FOREIGN KEY ("subscription_id")
      REFERENCES "donor_subscriptions"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donors" DROP CONSTRAINT "FK_donors_subscription_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_donors_razorpay_subscription_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_donors_subscription_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "donors" DROP COLUMN "razorpay_subscription_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "donors" DROP COLUMN "subscription_id"`,
    );
  }
}
