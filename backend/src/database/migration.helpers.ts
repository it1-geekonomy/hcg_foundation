import {
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
