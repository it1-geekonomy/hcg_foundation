/**
 * Tell the ingestion pipeline which CMS tables hold text worth indexing.
 * Aligned to ERD table names (independent tables, no FKs).
 */
export interface SourceTableConfig {
  table: string;
  idColumn: string;
  textColumns: string[];
}

export const SOURCE_TABLES: SourceTableConfig[] = [
  {
    table: 'projects',
    idColumn: 'id',
    textColumns: ['title', 'summary', 'description'],
  },
  {
    table: 'events',
    idColumn: 'id',
    textColumns: ['title', 'description', 'location'],
  },
  {
    table: 'patient_stories',
    idColumn: 'id',
    textColumns: ['patient_name', 'tagline', 'story', 'location'],
  },
  {
    table: 'articles',
    idColumn: 'id',
    textColumns: ['title', 'excerpt', 'content'],
  },
  {
    table: 'blogs',
    idColumn: 'id',
    textColumns: ['title', 'excerpt', 'content', 'author_name'],
  },
  {
    table: 'publications',
    idColumn: 'id',
    textColumns: ['title', 'description'],
  },
  {
    table: 'teams',
    idColumn: 'id',
    textColumns: ['title', 'designation', 'short_description', 'content'],
  },
  {
    table: 'trustees',
    idColumn: 'id',
    textColumns: ['name', 'designation', 'bio'],
  },
];
