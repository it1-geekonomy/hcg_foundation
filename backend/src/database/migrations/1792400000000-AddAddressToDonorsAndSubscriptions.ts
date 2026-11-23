import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressToDonorsAndSubscriptions1792400000000
  implements MigrationInterface
{
  name = 'AddAddressToDonorsAndSubscriptions1792400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donors" ADD "address" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "donation_subscriptions" ADD "address" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "donation_subscriptions" DROP COLUMN IF EXISTS "address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "donors" DROP COLUMN IF EXISTS "address"`,
    );
  }
}
