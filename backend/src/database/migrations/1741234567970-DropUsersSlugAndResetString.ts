import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropUsersSlugAndResetString1741234567970
  implements MigrationInterface
{
  name = 'DropUsersSlugAndResetString1741234567970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('users'))) return;

    if (await queryRunner.hasColumn('users', 'slug')) {
      await queryRunner.dropColumn('users', 'slug');
    }
    if (await queryRunner.hasColumn('users', 'reset_string')) {
      await queryRunner.dropColumn('users', 'reset_string');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('users'))) return;

    if (!(await queryRunner.hasColumn('users', 'slug'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'slug',
          type: 'varchar',
          length: '255',
          isNullable: true,
          isUnique: true,
        }),
      );
    }
    if (!(await queryRunner.hasColumn('users', 'reset_string'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'reset_string',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }
}
