import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDonorCountryCode1741234568040 implements MigrationInterface {
  name = 'AddDonorCountryCode1741234568040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('donors', 'country_code'))) {
      await queryRunner.addColumn(
        'donors',
        new TableColumn({
          name: 'country_code',
          type: 'varchar',
          length: '8',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('donors', 'country_code')) {
      await queryRunner.dropColumn('donors', 'country_code');
    }
  }
}
