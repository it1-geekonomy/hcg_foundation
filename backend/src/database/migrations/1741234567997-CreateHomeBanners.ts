import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { idColumn, timestampColumns } from '../migration.helpers';

export class CreateHomeBanners1741234567997 implements MigrationInterface {
  name = 'CreateHomeBanners1741234567997';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'home_banners',
        columns: [
          idColumn(),
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'short_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'banner_image_url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'mobile_banner_image_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'profile_image_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          ...timestampColumns(),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('home_banners', true);
  }
}
