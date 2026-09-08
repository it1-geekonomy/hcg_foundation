import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddTeamMemberType1741234567920 implements MigrationInterface {
  name = 'AddTeamMemberType1741234567920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('teams'))) return;
    if (await queryRunner.hasColumn('teams', 'member_type')) return;

    await queryRunner.addColumn(
      'teams',
      new TableColumn({
        name: 'member_type',
        type: 'enum',
        enum: ['trustee', 'team'],
        enumName: 'team_member_type',
        isNullable: false,
        default: `'trustee'`,
      }),
    );

    await queryRunner.createIndex(
      'teams',
      new TableIndex({
        name: 'idx_teams_member_type',
        columnNames: ['member_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('teams'))) return;
    const table = await queryRunner.getTable('teams');
    const index = table?.indices.find((i) => i.name === 'idx_teams_member_type');
    if (index) await queryRunner.dropIndex('teams', index);
    if (await queryRunner.hasColumn('teams', 'member_type')) {
      await queryRunner.dropColumn('teams', 'member_type');
    }
    await queryRunner.query(`DROP TYPE IF EXISTS "team_member_type"`);
  }
}
