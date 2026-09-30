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

export class CreateLeadsInternship1741234567972 implements MigrationInterface {
  name = 'CreateLeadsInternship1741234567972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('leads_internship')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'leads_internship',
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
            name: 'gender',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'dob',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'current_course',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'languages',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'computer_skills',
            type: 'text',
            isNullable: true,
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
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'leads_internship',
      new TableIndex({
        name: 'idx_leads_internship_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'leads_internship',
      new TableIndex({
        name: 'idx_leads_internship_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('leads_internship', true);
  }
}
