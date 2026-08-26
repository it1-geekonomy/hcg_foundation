/**
 * Maps legacy HCG CMS tables (from DB-Local MySQL dump) to chatbot knowledge.
 * Only text-bearing public content is indexed — leads/donors are excluded.
 */
export interface SourceTableConfig {
  table: string;
  idColumn: string;
  textColumns: string[];
}

export const SOURCE_TABLES: SourceTableConfig[] = [
  {
    table: 'blogs',
    idColumn: 'id',
    textColumns: ['title', 'short_description', 'content', 'author_name'],
  },
  {
    table: 'events',
    idColumn: 'id',
    textColumns: ['title', 'short_description', 'content', 'event_location', 'event_date'],
  },
  {
    table: 'news',
    idColumn: 'id',
    textColumns: ['title', 'short_description', 'content'],
  },
  {
    table: 'pages',
    idColumn: 'id',
    textColumns: ['title', 'content'],
  },
  {
    table: 'projects',
    idColumn: 'id',
    textColumns: ['title', 'short_description', 'content'],
  },
  {
    table: 'patientstories',
    idColumn: 'id',
    // Public story text only — exclude donation_state / internal fields
    textColumns: ['title', 'short_description', 'content'],
  },
  {
    table: 'patienttestimonials',
    idColumn: 'id',
    textColumns: ['title', 'meta_title', 'meta_description'],
  },
  {
    table: 'teams',
    idColumn: 'id',
    textColumns: ['title', 'designation', 'short_description', 'content'],
  },
  {
    table: 'announcements',
    idColumn: 'id',
    textColumns: ['title', 'content'],
  },
  {
    table: 'annualreports',
    idColumn: 'id',
    textColumns: ['title', 'meta_title', 'meta_description'],
  },
];
