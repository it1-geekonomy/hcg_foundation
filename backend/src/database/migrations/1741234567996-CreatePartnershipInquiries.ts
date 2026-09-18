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

export class CreatePartnershipInquiries1741234568010
  implements MigrationInterface
{
  name = 'CreatePartnershipInquiries1741234568010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('partnership_inquiries')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'partnership_inquiries',
        columns: [
          idColumn(),
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
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
            name: 'organization_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
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
      'partnership_inquiries',
      new TableIndex({
        name: 'idx_partnership_inquiries_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'partnership_inquiries',
      new TableIndex({
        name: 'idx_partnership_inquiries_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'partnership_inquiries',
      new TableIndex({
        name: 'idx_partnership_inquiries_created_at',
        columnNames: ['created_at'],
      }),
    );

    await ensureUpdatedAtFunction(queryRunner);
    await addUpdatedAtTrigger(queryRunner, 'partnership_inquiries');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('partnership_inquiries')) {
      await dropUpdatedAtTrigger(queryRunner, 'partnership_inquiries');
      await queryRunner.dropTable('partnership_inquiries', true);
    }
  }
}
