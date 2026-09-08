import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const TABLES = [
  'teams',
  'trustees',
  'awards',
  'annual_reports',
  'publications',
  'newsletters',
  'gallery',
  'articles',
  'blogs',
  'projects',
  'events',
  'patient_stories',
  'donors',
  'leads_contact',
] as const;

export class AddSeoMetaFieldsToContentTables1741234567900
  implements MigrationInterface
{
  name = 'AddSeoMetaFieldsToContentTables1741234567900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      if (!(await queryRunner.hasTable(table))) continue;

      const metaTitle = await queryRunner.hasColumn(table, 'meta_title');
      if (!metaTitle) {
        await queryRunner.addColumn(
          table,
          new TableColumn({
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
      }

      const metaDescription = await queryRunner.hasColumn(
        table,
        'meta_description',
      );
      if (!metaDescription) {
        await queryRunner.addColumn(
          table,
          new TableColumn({
            name: 'meta_description',
            type: 'text',
            isNullable: true,
          }),
        );
      }

      const schemaCode = await queryRunner.hasColumn(table, 'schema_code');
      if (!schemaCode) {
        await queryRunner.addColumn(
          table,
          new TableColumn({
            name: 'schema_code',
            type: 'text',
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      if (!(await queryRunner.hasTable(table))) continue;
      if (await queryRunner.hasColumn(table, 'schema_code')) {
        await queryRunner.dropColumn(table, 'schema_code');
      }
      if (await queryRunner.hasColumn(table, 'meta_description')) {
        await queryRunner.dropColumn(table, 'meta_description');
      }
      if (await queryRunner.hasColumn(table, 'meta_title')) {
        await queryRunner.dropColumn(table, 'meta_title');
      }
    }
  }
}
