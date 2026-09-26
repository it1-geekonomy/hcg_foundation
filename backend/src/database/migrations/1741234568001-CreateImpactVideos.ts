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

export class CreateImpactVideos1741234568001 implements MigrationInterface {
  name = 'CreateImpactVideos1741234568001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    if (await queryRunner.hasTable('impact_videos')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'impact_videos',
        columns: [
          idColumn(),
          {
            name: 'video_url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'display_order',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived'],
            enumName: 'content_status',
            isNullable: false,
            default: `'draft'`,
          },
          ...timestampColumns(),
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'impact_videos',
      new TableIndex({
        name: 'idx_impact_videos_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'impact_videos',
      new TableIndex({
        name: 'idx_impact_videos_display_order',
        columnNames: ['display_order'],
      }),
    );

    await ensureUpdatedAtFunction(queryRunner);
    await addUpdatedAtTrigger(queryRunner, 'impact_videos');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('impact_videos')) {
      await dropUpdatedAtTrigger(queryRunner, 'impact_videos');
      await queryRunner.dropTable('impact_videos', true);
    }
  }
}
