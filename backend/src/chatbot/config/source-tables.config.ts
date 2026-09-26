/**
 * Published CMS tables the chatbot may index.
 * Never include donors, leads, fundraising, partnerships, or users.
 */
export type SourceCategory =
  | 'Blog'
  | 'Event'
  | 'Project'
  | 'Patient Story'
  | 'Patient Testimonial'
  | 'Team'
  | 'Trustee'
  | 'Annual Report'
  | 'Award'
  | 'Page'
  | 'Legal';

export interface SourceTableConfig {
  table: string;
  idColumn: string;
  /** Prefer DB column names (snake_case) for raw SQL. */
  textColumns: string[];
  statusColumn?: 'status' | 'is_active';
  category: SourceCategory;
  /** Build a public URL from the row. */
  buildUrl: (row: Record<string, unknown>) => string;
  /** Optional designation / role field. */
  designationColumn?: string;
  titleColumn?: string;
  slugColumn?: string;
}

function slugOrId(row: Record<string, unknown>, slugCol?: string): string {
  if (slugCol && row[slugCol]) return String(row[slugCol]);
  return String(row.id ?? '');
}

export const SOURCE_TABLES: SourceTableConfig[] = [
  {
    table: 'blogs',
    idColumn: 'id',
    textColumns: [
      'title',
      'short_description',
      'content',
      'author_name',
      'author_designation',
      'blog_date',
    ],
    statusColumn: 'status',
    category: 'Blog',
    titleColumn: 'title',
    slugColumn: 'slug',
    designationColumn: 'author_designation',
    buildUrl: (row) => `/resources/blogs/${slugOrId(row, 'slug')}`,
  },
  {
    table: 'events',
    idColumn: 'id',
    textColumns: [
      'title',
      'short_description',
      'content',
      'event_date',
      'event_location',
      'event_time',
    ],
    statusColumn: 'status',
    category: 'Event',
    titleColumn: 'title',
    slugColumn: 'slug',
    buildUrl: (row) => `/resources/events/${slugOrId(row, 'slug')}`,
  },
  {
    table: 'projects',
    idColumn: 'id',
    textColumns: ['title', 'short_description', 'content', 'project_date'],
    statusColumn: 'status',
    category: 'Project',
    titleColumn: 'title',
    slugColumn: 'slug',
    buildUrl: (row) => `/resources/projects/${slugOrId(row, 'slug')}`,
  },
  {
    table: 'patient_stories',
    idColumn: 'id',
    textColumns: [
      'title',
      'short_description',
      'content',
      'story_date',
      'donation_state',
    ],
    statusColumn: 'status',
    category: 'Patient Story',
    titleColumn: 'title',
    slugColumn: 'slug',
    buildUrl: (row) =>
      `/journey-of-hope/patient-stories/${slugOrId(row, 'slug')}`,
  },
  {
    table: 'patient_testimonials',
    idColumn: 'id',
    textColumns: ['title', 'meta_description'],
    statusColumn: 'status',
    category: 'Patient Testimonial',
    titleColumn: 'title',
    buildUrl: () => `/journey-of-hope/testimonials`,
  },
  {
    table: 'teams',
    idColumn: 'id',
    textColumns: ['title', 'designation', 'short_description', 'content'],
    statusColumn: 'status',
    category: 'Team',
    titleColumn: 'title',
    designationColumn: 'designation',
    buildUrl: (row) => `/about/our-team/${String(row.id ?? '')}`,
  },
  {
    table: 'trustees',
    idColumn: 'id',
    textColumns: ['title', 'designation', 'short_description', 'content'],
    statusColumn: 'status',
    category: 'Trustee',
    titleColumn: 'title',
    designationColumn: 'designation',
    buildUrl: () => `/about/our-team`,
  },
  {
    table: 'annual_reports',
    idColumn: 'id',
    textColumns: ['title', 'report_year', 'meta_description'],
    statusColumn: 'status',
    category: 'Annual Report',
    titleColumn: 'title',
    slugColumn: 'slug',
    buildUrl: () => `/resources/annual-reports`,
  },
  {
    table: 'awards',
    idColumn: 'id',
    textColumns: ['title', 'description', 'year'],
    statusColumn: 'status',
    category: 'Award',
    titleColumn: 'title',
    buildUrl: () => `/about-us`,
  },
  {
    table: 'terms_and_conditions',
    idColumn: 'id',
    textColumns: ['title', 'content'],
    statusColumn: 'status',
    category: 'Legal',
    titleColumn: 'title',
    buildUrl: () => `/terms`,
  },
  {
    table: 'privacy_policy',
    idColumn: 'id',
    textColumns: ['title', 'content'],
    statusColumn: 'status',
    category: 'Legal',
    titleColumn: 'title',
    buildUrl: () => `/privacy`,
  },
  {
    table: 'home_banners',
    idColumn: 'id',
    textColumns: ['name', 'title', 'location', 'short_description'],
    statusColumn: 'is_active',
    category: 'Page',
    titleColumn: 'title',
    buildUrl: () => `/`,
  },
];
