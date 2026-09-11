import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';
import {
  idColumn,
  seoColumns,
  timestampColumns,
  statusIndex,
} from '../migration.helpers';

export class CreatePatientStories1741234567976 implements MigrationInterface {
  name = 'CreatePatientStories1741234567976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop legacy scaffold if present
    if (await queryRunner.hasTable('patient_stories')) {
      const isLegacy =
        (await queryRunner.hasColumn('patient_stories', 'image_url')) ||
        (await queryRunner.hasColumn('patient_stories', 'is_published'));
      if (isLegacy) {
        await queryRunner.dropTable('patient_stories', true);
      } else {
        return;
      }
    }

    await queryRunner.createTable(
      new Table({
        name: 'patient_stories',
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
            name: 'patient_image',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'story_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'donation_state',
            type: 'varchar',
            length: '250',
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
      'patient_stories',
      new TableIndex(statusIndex('patient_stories')),
    );

    await queryRunner.createIndex(
      'patient_stories',
      new TableIndex({
        name: 'idx_patient_stories_date',
        columnNames: ['story_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('patient_stories', true);
  }
}
