import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDonorSubscriptions1792000000000 implements MigrationInterface {
  name = 'CreateDonorSubscriptions1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "donor_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "full_name" character varying(255) NOT NULL,
        "phone" character varying(20),
        "email" character varying(255) NOT NULL,
        "city" character varying(255),
        "country" character varying(100),
        "country_code" character varying(8),
        "is_international" boolean NOT NULL DEFAULT false,
        "pan" character varying(20),
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying(10) NOT NULL DEFAULT 'INR',
        "period" character varying(20) NOT NULL DEFAULT 'monthly',
        "donation_category" "public"."donation_category_enum" NOT NULL DEFAULT 'General Funds',
        "patient_story_id" uuid,
        "razorpay_customer_id" character varying(255),
        "razorpay_plan_id" character varying(255),
        "razorpay_subscription_id" character varying(255) NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'created',
        "total_count" integer NOT NULL DEFAULT 60,
        "paid_count" integer NOT NULL DEFAULT 0,
        "current_start" TIMESTAMP WITH TIME ZONE,
        "current_end" TIMESTAMP WITH TIME ZONE,
        "ended_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_donor_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_donor_subscriptions_razorpay_subscription_id" UNIQUE ("razorpay_subscription_id"),
        CONSTRAINT "FK_donor_subscriptions_patient_story_id" FOREIGN KEY ("patient_story_id") REFERENCES "patient_stories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_donor_subscriptions_email" ON "donor_subscriptions" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donor_subscriptions_status" ON "donor_subscriptions" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donor_subscriptions_razorpay_subscription_id" ON "donor_subscriptions" ("razorpay_subscription_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donor_subscriptions_patient_story_id" ON "donor_subscriptions" ("patient_story_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_donor_subscriptions_plan_lookup" ON "donor_subscriptions" ("amount", "period", "currency")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "donor_subscriptions"`);
  }
}
