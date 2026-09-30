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

export class AddVolunteerEntity1790159913249 implements MigrationInterface {
  name = 'AddVolunteerEntity1790159913249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('volunteer')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'volunteer',
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
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'city_location',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'educational_qualification',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'areas_of_interest',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'terms_accepted',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          ...timestampColumns(),
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'volunteer',
      new TableIndex({
        name: 'idx_volunteer_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'volunteer',
      new TableIndex({
        name: 'idx_volunteer_created_at',
        columnNames: ['created_at'],
      }),
    );
    
    await queryRunner.createIndex(
      'volunteer',
      new TableIndex({
        name: 'idx_volunteer_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('volunteer', true);
  }
}
