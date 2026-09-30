import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';
import {
  idColumn,
  timestampColumns,
} from '../migration.helpers';

export class CreateLeadsContact1741234567971 implements MigrationInterface {
  name = 'CreateLeadsContact1741234567971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('leads_contact')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'leads_contact',
        columns: [
          idColumn(),
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'leads_contact',
      new TableIndex({
        name: 'idx_leads_contact_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'leads_contact',
      new TableIndex({
        name: 'idx_leads_contact_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('leads_contact', true);
  }
}
