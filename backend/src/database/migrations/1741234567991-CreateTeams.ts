import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreateTeams1741234567991 implements MigrationInterface {
  name = 'CreateTeams1741234567991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        columns: [
          idColumn(),
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'designation',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'team_image',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'short_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'content_status',
            isNullable: false,
            default: `'draft'`,
          },
          ...seoColumns(),
          ...timestampColumns(),
        ],
      }),
      true,
    );

    const statusIndexExists = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE tablename = 'teams' AND indexname = 'idx_teams_status'`,
    );
    if (!statusIndexExists.length) {
      await queryRunner.createIndex(
        'teams',
        new TableIndex(statusIndex('teams')),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('teams', true);
  }
}
