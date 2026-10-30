import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDonationSubscriptions1792300000000 implements MigrationInterface {
  name = 'CreateDonationSubscriptions1792300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "donation_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "full_name" character varying(255) NOT NULL,
        "phone" character varying(20),
        "email" character varying(255),
        "city" character varying(255),
        "pan" character varying(20),
        "message" text,
        "donation_category" "public"."donation_category_enum" NOT NULL DEFAULT 'General Funds',
        "patient_story_id" uuid,
        "frequency" character varying(20) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying(10) NOT NULL DEFAULT 'INR',
        "razorpay_plan_id" character varying(255) NOT NULL,
        "razorpay_subscription_id" character varying(255) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'created',
        "paid_count" integer NOT NULL DEFAULT 0,
        "total_count" integer NOT NULL,
        "next_charge_at" TIMESTAMP WITH TIME ZONE,
        "ended_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_donation_subscriptions_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_donation_subscriptions_razorpay_id" ON "donation_subscriptions" ("razorpay_subscription_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donation_subscriptions_status" ON "donation_subscriptions" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donation_subscriptions_email" ON "donation_subscriptions" ("email")`,
    );

    await queryRunner.query(`ALTER TABLE "donors" ADD "subscription_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "donors" ADD CONSTRAINT "FK_donors_subscription_id" FOREIGN KEY ("subscription_id") REFERENCES "donation_subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donors_subscription_id" ON "donors" ("subscription_id")`,
    );
    // The checkout handler and the subscription.charged webhook can race to record the same charge.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_donors_subscription_payment" ON "donors" ("razorpay_payment_id") WHERE "subscription_id" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."uq_donors_subscription_payment"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_donors_subscription_id"`);
    await queryRunner.query(
      `ALTER TABLE "donors" DROP CONSTRAINT IF EXISTS "FK_donors_subscription_id"`,
    );
    await queryRunner.query(`ALTER TABLE "donors" DROP COLUMN IF EXISTS "subscription_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "donation_subscriptions"`);
  }
}
