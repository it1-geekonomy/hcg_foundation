import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';
import {
  addUpdatedAtTrigger,
  dropUpdatedAtTrigger,
  ensureUpdatedAtFunction,
  idColumn,
  timestampColumns,
} from '../migration.helpers';

export class CreateFundraisingCampaigns1741234568000
  implements MigrationInterface
{
  name = 'CreateFundraisingCampaigns1741234568000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('fundraising_campaigns')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'fundraising_campaigns',
        columns: [
          idColumn(),
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'fundraising_goal',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'fundraising_reason',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'terms_accepted',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: `'pending'`,
          },
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'fundraising_campaigns',
      new TableIndex({
        name: 'idx_fundraising_campaigns_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'fundraising_campaigns',
      new TableIndex({
        name: 'idx_fundraising_campaigns_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'fundraising_campaigns',
      new TableIndex({
        name: 'idx_fundraising_campaigns_created_at',
        columnNames: ['created_at'],
      }),
    );

    await ensureUpdatedAtFunction(queryRunner);
    await addUpdatedAtTrigger(queryRunner, 'fundraising_campaigns');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('fundraising_campaigns')) {
      await dropUpdatedAtTrigger(queryRunner, 'fundraising_campaigns');
      await queryRunner.dropTable('fundraising_campaigns', true);
    }
  }
}
