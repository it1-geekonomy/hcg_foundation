import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES = [
  'users',
  'events',
  'annual_reports',
  'blogs',
  'patient_stories',
  'leads_contact',
  'leads_internship',
  'donors',
  'projects',
  'patient_testimonials',
  'teams',
  'trustees',
  'fundraising_campaigns',
  'partnership_inquiries',
  'privacy_policy',
  'terms_and_conditions',
  'home_banners',
  'impact_videos',
  'awards',
] as const;

/** Unique columns that must stay reusable after a soft-delete. */
const PARTIAL_UNIQUES: Array<{ table: string; column: string }> = [
  { table: 'users', column: 'email' },
  { table: 'users', column: 'username' },
  { table: 'blogs', column: 'slug' },
  { table: 'events', column: 'slug' },
  { table: 'projects', column: 'slug' },
  { table: 'patient_stories', column: 'slug' },
  { table: 'patient_testimonials', column: 'slug' },
  { table: 'annual_reports', column: 'slug' },
];

export class AddSoftDeleteToAllTables1741234568030 implements MigrationInterface {
  name = 'AddSoftDeleteToAllTables1741234568030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      const hasTable = await queryRunner.hasTable(table);
      if (!hasTable) continue;
      const hasColumn = await queryRunner.hasColumn(table, 'deleted_at');
      if (hasColumn) continue;

      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN "deleted_at" TIMESTAMPTZ NULL`,
      );
      await queryRunner.query(
        `CREATE INDEX "idx_${table}_deleted_at" ON "${table}" ("deleted_at")`,
      );
    }

    for (const { table, column } of PARTIAL_UNIQUES) {
      await this.convertToPartialUnique(queryRunner, table, column);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { table, column } of [...PARTIAL_UNIQUES].reverse()) {
      await this.restoreFullUnique(queryRunner, table, column);
    }

    for (const table of [...TABLES].reverse()) {
      const hasTable = await queryRunner.hasTable(table);
      if (!hasTable) continue;
      if (!(await queryRunner.hasColumn(table, 'deleted_at'))) continue;

      await queryRunner.query(
        `DROP INDEX IF EXISTS "idx_${table}_deleted_at"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN "deleted_at"`,
      );
    }
  }

  private async convertToPartialUnique(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<void> {
    if (!(await queryRunner.hasTable(table))) return;
    if (!(await queryRunner.hasColumn(table, column))) return;

    const constraints: Array<{ conname: string }> = await queryRunner.query(
      `
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
      WHERE n.nspname = 'public'
        AND t.relname = $1
        AND c.contype = 'u'
        AND a.attname = $2
      `,
      [table, column],
    );

    for (const row of constraints) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${row.conname}"`,
      );
    }

    const indexes: Array<{ index_name: string }> = await queryRunner.query(
      `
      SELECT i.relname AS index_name
      FROM pg_index x
      JOIN pg_class t ON t.oid = x.indrelid
      JOIN pg_class i ON i.oid = x.indexrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (x.indkey)
      WHERE n.nspname = 'public'
        AND t.relname = $1
        AND x.indisunique
        AND NOT x.indisprimary
        AND a.attname = $2
      `,
      [table, column],
    );

    for (const row of indexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS "${row.index_name}"`);
    }

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_${table}_${column}_active" ON "${table}" ("${column}") WHERE "deleted_at" IS NULL`,
    );
  }

  private async restoreFullUnique(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<void> {
    if (!(await queryRunner.hasTable(table))) return;
    if (!(await queryRunner.hasColumn(table, column))) return;

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_${table}_${column}_active"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_${table}_${column}" ON "${table}" ("${column}")`,
    );
  }
}
