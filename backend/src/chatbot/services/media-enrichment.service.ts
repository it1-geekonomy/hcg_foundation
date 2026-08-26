import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type ChatVisual = {
  id: string;
  kind: 'image' | 'report' | 'story' | 'event' | 'project' | 'blog';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  badge?: string;
};

type SourceRef = { table: string; id: string };

const SITE_BASE = 'https://www.hcgfoundation.org';

const TABLE_FOLDER: Record<string, string> = {
  blogs: 'blog',
  events: 'event',
  projects: 'project',
  patientstories: 'patientstory',
  annualreports: 'annualreport',
  news: 'news',
  teams: 'team',
};

/** Live HCG website route prefixes (verified against production). */
function pageUrl(table: string, slug?: string | null): string | undefined {
  const s = String(slug || '').trim().replace(/^\/+/, '');
  switch (table) {
    case 'blogs':
      return s ? `${SITE_BASE}/blog/${s}` : `${SITE_BASE}/blog`;
    case 'patientstories':
      return s ? `${SITE_BASE}/patient-stories/${s}` : `${SITE_BASE}/patient-stories`;
    case 'events':
      return s ? `${SITE_BASE}/events/${s}` : `${SITE_BASE}/events`;
    case 'pages':
      return s ? `${SITE_BASE}/pages/${s}` : SITE_BASE;
    case 'projects':
      // Detail slugs in the dump are incomplete; listing is the working page.
      return `${SITE_BASE}/projects`;
    case 'news':
      return `${SITE_BASE}/news`;
    case 'teams':
      return `${SITE_BASE}/team`;
    case 'annualreports':
      return `${SITE_BASE}/annual-reports`;
    case 'announcements':
      return SITE_BASE;
    default:
      return s ? `${SITE_BASE}/${s}` : SITE_BASE;
  }
}

const KIND_ORDER: Record<string, number> = {
  report: 0,
  blog: 1,
  event: 2,
  project: 3,
  story: 4,
  image: 5,
};

function stripHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

@Injectable()
export class MediaEnrichmentService {
  private readonly mediaBase: string;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    this.mediaBase = (
      this.config.get<string>('CMS_MEDIA_BASE_URL') ||
      'https://www.hcgfoundation.org/assets/uploads'
    ).replace(/\/$/, '');
  }

  async enrich(sources: string[], question = ''): Promise<{
    visuals: ChatVisual[];
    insights: { label: string; value: string }[];
  }> {
    const intent = this.detectIntent(question);
    const refs = this.parseSources(sources).slice(0, 8);
    const visuals: ChatVisual[] = [];

    for (const ref of refs) {
      if (!this.tableMatchesIntent(ref.table, intent)) continue;
      visuals.push(...(await this.loadVisualsForSource(ref)));
    }

    // Extra gallery only when the user actually asked for that content type.
    if (intent === 'reports') {
      visuals.push(...(await this.loadRecentReports(8)));
    } else if (intent === 'stories') {
      visuals.push(...(await this.loadRecentStories(6)));
    } else if (intent === 'events') {
      // keep only event cards from sources — no extra dump
    }

    const seen = new Set<string>();
    const unique = visuals
      .filter((v) => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return Boolean(v.title && (v.imageUrl || v.linkUrl));
      })
      .sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9))
      .slice(0, intent === 'reports' || intent === 'stories' ? 8 : 3);

    const seen = new Set<string>();
    const unique = visuals
      .filter((v) => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return Boolean(v.title);
      })
      .sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9))
      .slice(0, 8);

    const counts = unique.reduce<Record<string, number>>((acc, v) => {
      acc[v.kind] = (acc[v.kind] || 0) + 1;
      return acc;
    }, {});

    const insights = [
      { label: 'Sources used', value: String(refs.length || 0) },
      ...Object.entries(counts).map(([kind, n]) => ({
        label: this.prettyKind(kind),
        value: String(n),
      })),
    ].slice(0, 4);

    return { visuals: unique, insights };
  }

  private detectIntent(
    question: string,
  ): 'reports' | 'stories' | 'events' | 'blogs' | 'projects' | 'general' {
    const q = (question || '').toLowerCase();
    if (/\b(annual\s*report|reports?|pdf)\b/.test(q)) return 'reports';
    if (/\b(patient\s*stor(y|ies)|journey|testimonial)\b/.test(q)) return 'stories';
    if (/\b(event|celebration|camp|programme|program)\b/.test(q)) return 'events';
    if (/\b(blog|prevent|prevention|awareness)\b/.test(q)) return 'blogs';
    if (/\b(project|initiative|what we do)\b/.test(q)) return 'projects';
    return 'general';
  }

  private tableMatchesIntent(table: string, intent: string): boolean {
    if (intent === 'reports') return table === 'annualreports';
    if (intent === 'stories') return table === 'patientstories';
    if (intent === 'events') return table === 'events';
    if (intent === 'blogs') return table === 'blogs' || table === 'news';
    if (intent === 'projects') return table === 'projects';
    // General Q&A: only show a visual if the source itself is a visual type
    // and skip noisy extras (teams/pages).
    return ['blogs', 'events', 'projects', 'patientstories', 'annualreports'].includes(table);
  }

  private async loadRecentReports(limit: number): Promise<ChatVisual[]> {
    try {
      const rows = await this.dataSource.query(
        `SELECT id, title, annualreport_banner, annual_report_file
         FROM annualreports
         ORDER BY id DESC
         LIMIT ?`,
        [limit],
      );
      return rows.map((row: any) => this.toReportCard(row));
    } catch {
      return [];
    }
  }

  private async loadRecentStories(limit: number): Promise<ChatVisual[]> {
    try {
      const rows = await this.dataSource.query(
        `SELECT id, title, slug, short_description, patient_image
         FROM patientstories
         WHERE patient_image IS NOT NULL AND patient_image != ''
         ORDER BY id DESC
         LIMIT ?`,
        [limit],
      );
      return rows.map((row: any) => this.toStoryCard(row));
    } catch {
      return [];
    }
  }

  private toReportCard(row: any): ChatVisual {
    // Prefer the PDF file when available; otherwise the annual-reports listing page.
    const pdf = this.mediaUrl('annualreport', row.annual_report_file);
    return {
      id: `annualreports-${row.id}`,
      kind: 'report',
      title: stripHtml(row.title) || 'Annual report',
      subtitle: pdf ? 'Official PDF report' : 'View annual reports',
      imageUrl: this.mediaUrl('annualreport', row.annualreport_banner),
      linkUrl: pdf || pageUrl('annualreports'),
      badge: 'Report',
    };
  }

  private toStoryCard(row: any): ChatVisual {
    const subtitle = stripHtml(row.short_description);
    return {
      id: `patientstories-${row.id}`,
      kind: 'story',
      title: stripHtml(row.title) || 'Patient story',
      subtitle: subtitle ? subtitle.slice(0, 90) : undefined,
      imageUrl: this.mediaUrl('patientstory', row.patient_image),
      linkUrl: pageUrl('patientstories', row.slug),
      badge: 'Story',
    };
  }

  private prettyKind(kind: string): string {
    const map: Record<string, string> = {
      blog: 'Blogs',
      event: 'Events',
      story: 'Stories',
      project: 'Projects',
      report: 'Reports',
      image: 'Images',
    };
    return map[kind] || kind;
  }

  private parseSources(sources: string[]): SourceRef[] {
    return (sources || [])
      .map((s) => {
        const [table, id] = String(s).split('#');
        if (!table || !id) return null;
        return { table, id };
      })
      .filter((x): x is SourceRef => Boolean(x));
  }

  private mediaUrl(folder: string, filename?: string | null): string | undefined {
    if (!filename) return undefined;
    // Normalize weird unicode spaces in legacy CMS filenames, then encode.
    const name = String(filename)
      .trim()
      .replace(/[\u00A0\u202F\u2007\u2060]/g, ' ')
      .replace(/\s+/g, ' ');
    if (!name) return undefined;
    if (/^https?:\/\//i.test(name)) return name;
    return `${this.mediaBase}/${folder}/${encodeURIComponent(name)}`;
  }

  private async loadVisualsForSource(ref: SourceRef): Promise<ChatVisual[]> {
    const { table, id } = ref;
    const folder = TABLE_FOLDER[table];

    try {
      if (table === 'blogs') {
        const rows = await this.dataSource.query(
          'SELECT id, title, slug, short_description, blog_banner FROM blogs WHERE id = ? LIMIT 1',
          [id],
        );
        const row = rows[0];
        if (!row) return [];
        const subtitle = stripHtml(row.short_description);
        return [
          {
            id: `blogs-${row.id}`,
            kind: 'blog',
            title: stripHtml(row.title) || 'Blog',
            subtitle: subtitle ? subtitle.slice(0, 90) : undefined,
            imageUrl: this.mediaUrl(folder, row.blog_banner),
            linkUrl: pageUrl('blogs', row.slug),
            badge: 'Blog',
          },
        ];
      }

      if (table === 'events') {
        const rows = await this.dataSource.query(
          'SELECT id, title, slug, short_description, event_banner, event_date, event_location FROM events WHERE id = ? LIMIT 1',
          [id],
        );
        const row = rows[0];
        if (!row) return [];
        const meta = [row.event_date, row.event_location].filter(Boolean).join(' · ');
        const subtitle = meta || stripHtml(row.short_description);
        return [
          {
            id: `events-${row.id}`,
            kind: 'event',
            title: stripHtml(row.title) || 'Event',
            subtitle: subtitle ? String(subtitle).slice(0, 90) : undefined,
            imageUrl: this.mediaUrl(folder, row.event_banner),
            linkUrl: pageUrl('events', row.slug),
            badge: 'Event',
          },
        ];
      }

      if (table === 'projects') {
        const rows = await this.dataSource.query(
          'SELECT id, title, slug, short_description, project_banner FROM projects WHERE id = ? LIMIT 1',
          [id],
        );
        const row = rows[0];
        if (!row) return [];
        const subtitle = stripHtml(row.short_description);
        return [
          {
            id: `projects-${row.id}`,
            kind: 'project',
            title: stripHtml(row.title) || 'Project',
            subtitle: subtitle ? subtitle.slice(0, 90) : undefined,
            imageUrl: this.mediaUrl(folder, row.project_banner),
            linkUrl: pageUrl('projects', row.slug),
            badge: 'Project',
          },
        ];
      }

      if (table === 'patientstories') {
        const rows = await this.dataSource.query(
          'SELECT id, title, slug, short_description, patient_image FROM patientstories WHERE id = ? LIMIT 1',
          [id],
        );
        const row = rows[0];
        if (!row) return [];
        return [this.toStoryCard(row)];
      }

      if (table === 'annualreports') {
        const rows = await this.dataSource.query(
          'SELECT id, title, annualreport_banner, annual_report_file FROM annualreports WHERE id = ? LIMIT 1',
          [id],
        );
        const row = rows[0];
        if (!row) return [];
        return [this.toReportCard(row)];
      }
    } catch {
      return [];
    }

    return [];
  }
}
