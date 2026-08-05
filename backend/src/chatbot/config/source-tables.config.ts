/**
 * Tell the ingestion pipeline which of your CMS tables hold text worth
 * indexing, and which columns contain the actual content.
 *
 * Add one entry per table. `idColumn` is normally your primary key.
 * `textColumns` are every column whose value should become chatbot knowledge
 * (title, description, body, etc.) — they get concatenated per row before chunking.
 *
 * EDIT THIS to match your real CMS schema.
 */
export interface SourceTableConfig {
  table: string;
  idColumn: string;
  textColumns: string[];
}

export const SOURCE_TABLES: SourceTableConfig[] = [
  {
    table: 'programs',
    idColumn: 'id',
    textColumns: ['title', 'description'],
  },
  {
    table: 'events',
    idColumn: 'id',
    textColumns: ['title', 'description', 'location'],
  },
  {
    table: 'faqs',
    idColumn: 'id',
    textColumns: ['question', 'answer'],
  },
  {
    table: 'pages',
    idColumn: 'id',
    textColumns: ['title', 'content'],
  },
  // Add more tables here as needed, e.g. 'team_members', 'testimonials', 'news_posts'...
];
