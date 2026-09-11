import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreatePrivacyPolicy1741234567999 implements MigrationInterface {
  name = 'CreatePrivacyPolicy1741234567999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop legacy scaffold if present
    if (await queryRunner.hasTable('privacy_policy')) {
      const isLegacy =
        (await queryRunner.hasColumn('privacy_policy', 'image_url')) ||
        (await queryRunner.hasColumn('privacy_policy', 'is_published'));
      if (isLegacy) {
        await queryRunner.dropTable('privacy_policy', true);
      } else {
        return;
      }
    }

    await queryRunner.createTable(
      new Table({
        name: 'privacy_policy',
        columns: [
          idColumn(),
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived'],
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

    await queryRunner.createIndex(
      'privacy_policy',
      new TableIndex(statusIndex('privacy_policy')),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('privacy_policy', true);
  }
}
