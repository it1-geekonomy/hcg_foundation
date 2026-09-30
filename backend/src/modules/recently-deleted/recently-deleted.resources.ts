export const RECENTLY_DELETED_RESOURCES = [
  { resource: 'blogs', table: 'blogs', titleSql: 'title' },
  { resource: 'events', table: 'events', titleSql: 'title' },
  { resource: 'projects', table: 'projects', titleSql: 'title' },
  { resource: 'patient-stories', table: 'patient_stories', titleSql: 'title' },
  {
    resource: 'patient-testimonials',
    table: 'patient_testimonials',
    titleSql: 'title',
  },
  { resource: 'annual-reports', table: 'annual_reports', titleSql: 'title' },
  { resource: 'teams', table: 'teams', titleSql: 'title' },
  { resource: 'trustees', table: 'trustees', titleSql: 'title' },
  { resource: 'awards', table: 'awards', titleSql: 'title' },
  {
    resource: 'impact-videos',
    table: 'impact_videos',
    titleSql: `'Impact video'`,
  },
  { resource: 'home-banners', table: 'home_banners', titleSql: 'title' },
  { resource: 'privacy-policy', table: 'privacy_policy', titleSql: 'title' },
  {
    resource: 'terms-and-conditions',
    table: 'terms_and_conditions',
    titleSql: 'title',
  },
  { resource: 'leads-contact', table: 'leads_contact', titleSql: 'full_name' },
  {
    resource: 'leads-internship',
    table: 'leads_internship',
    titleSql: 'full_name',
  },
  {
    resource: 'fundraising-campaigns',
    table: 'fundraising_campaigns',
    titleSql: 'full_name',
  },
  {
    resource: 'partnership-inquiries',
    table: 'partnership_inquiries',
    titleSql: 'full_name',
  },
  { resource: 'users', table: 'users', titleSql: 'full_name' },
] as const;

export type RecentlyDeletedResource =
  (typeof RECENTLY_DELETED_RESOURCES)[number]['resource'];
