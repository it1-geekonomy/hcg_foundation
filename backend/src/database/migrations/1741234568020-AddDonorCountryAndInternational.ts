import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddDonorCountryAndInternational1741234568020
  implements MigrationInterface
{
  name = 'AddDonorCountryAndInternational1741234568020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('donors'))) return;

    if (!(await queryRunner.hasColumn('donors', 'country'))) {
      await queryRunner.addColumn(
        'donors',
        new TableColumn({
          name: 'country',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('donors', 'is_international'))) {
      await queryRunner.addColumn(
        'donors',
        new TableColumn({
          name: 'is_international',
          type: 'boolean',
          isNullable: false,
          default: false,
        }),
      );
    }

    const table = await queryRunner.getTable('donors');
    const hasIndex = table?.indices.some(
      (idx) => idx.name === 'idx_donors_is_international',
    );
    if (!hasIndex) {
      await queryRunner.createIndex(
        'donors',
        new TableIndex({
          name: 'idx_donors_is_international',
          columnNames: ['is_international'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('donors'))) return;

    const table = await queryRunner.getTable('donors');
    if (table?.indices.some((idx) => idx.name === 'idx_donors_is_international')) {
      await queryRunner.dropIndex('donors', 'idx_donors_is_international');
    }
    if (await queryRunner.hasColumn('donors', 'is_international')) {
      await queryRunner.dropColumn('donors', 'is_international');
    }
    if (await queryRunner.hasColumn('donors', 'country')) {
      await queryRunner.dropColumn('donors', 'country');
    }
  }
}
