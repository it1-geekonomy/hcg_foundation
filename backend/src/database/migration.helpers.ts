import {
  QueryRunner,
  TableColumnOptions,
  TableIndexOptions,
} from 'typeorm';

/** UUID primary key column — always present on every table */
export function idColumn(): TableColumnOptions {
  return {
    name: 'id',
    type: 'uuid',
    isPrimary: true,
    isNullable: false,
    isUnique: true,
    generationStrategy: 'uuid',
    default: 'gen_random_uuid()',
  };
}

export function timestampColumns(): TableColumnOptions[] {
  return [
    {
      name: 'created_at',
      type: 'timestamptz',
      isNullable: false,
      default: 'CURRENT_TIMESTAMP',
    },
    {
      name: 'updated_at',
      type: 'timestamptz',
      isNullable: false,
      default: 'CURRENT_TIMESTAMP',
    },
  ];
}

export function seoColumns(): TableColumnOptions[] {
  return [
    {
      name: 'meta_title',
      type: 'varchar',
      length: '255',
      isNullable: true,
    },
    {
      name: 'meta_description',
      type: 'text',
      isNullable: true,
    },
    {
      name: 'schema_code',
      type: 'text',
      isNullable: true,
    },
  ];
}

export function statusIndex(table: string): TableIndexOptions {
  return {
    name: `idx_${table}_status`,
    columnNames: ['status'],
  };
}

/** Shared Postgres function used by every `updated_at` trigger. */
export async function ensureUpdatedAtFunction(
  queryRunner: QueryRunner,
): Promise<void> {
  await queryRunner.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

/** BEFORE UPDATE trigger — call this in every new table migration. */
export async function addUpdatedAtTrigger(
  queryRunner: QueryRunner,
  table: string,
): Promise<void> {
  await queryRunner.query(
    `DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}"`,
  );
  await queryRunner.query(`
    CREATE TRIGGER update_${table}_updated_at
    BEFORE UPDATE ON "${table}"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function dropUpdatedAtTrigger(
  queryRunner: QueryRunner,
  table: string,
): Promise<void> {
  await queryRunner.query(
    `DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}"`,
  );
}
