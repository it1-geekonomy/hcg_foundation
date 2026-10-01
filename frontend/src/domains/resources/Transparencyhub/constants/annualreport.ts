export interface Report {
  id: string;
  title: string;
  description: string;
  pages: string;
  pdfUrl: string;
}

/** The single annual report banner; uploads must match this size exactly. */
export const ANNUAL_REPORT_BANNER_SIZE = { width: 557, height: 556 } as const;

/** Map a published CMS annual report onto the transparency hub card (CMS values only, no defaults). */
export function mapAnnualReportToCard(report: {
  id: string;
  title?: string | null;
  shortDescription?: string | null;
  annualReportFile?: string | null;
}): Report {
  return {
    id: report.id,
    title: report.title?.trim() || "",
    description: report.shortDescription?.trim() || "",
    pages: "",
    pdfUrl: report.annualReportFile?.trim() || "",
  };
}

/** Page count from the PDF the API returns (catalog `/Count`, else page objects). */
export async function countPdfPages(url: string): Promise<number | null> {
  try {
    if (!url) return null;
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      // Fallback through Next.js proxy if direct client fetch is blocked by CORS
      res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
    }

    if (!res.ok) {
      res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
    }

    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const text = new TextDecoder("latin1").decode(buffer);

    let max = 0;
    const counts = text.matchAll(/\/Type\s*\/Pages\b[\s\S]{0,240}?\/Count\s+(\d+)/g);
    for (const match of counts) {
      const n = Number(match[1]);
      if (n > max && n < 20000) max = n;
    }
    if (max > 0) return max;

    const pages = text.match(/\/Type\s*\/Page(?!s)\b/g);
    return pages?.length ? pages.length : null;
  } catch {
    return null;
  }
}

export function formatPageCount(count: number) {
  return count === 1 ? "1 Page" : `${count} Pages`;
}
export const BREAKPOINTS = [
  { minWidth: 1280, perPage: 12, cols: "grid-cols-4" }, 
  { minWidth: 1024, perPage: 9, cols: "grid-cols-3" }, 
  { minWidth: 640, perPage: 6, cols: "grid-cols-2" },   
  { minWidth: 0, perPage: 3, cols: "grid-cols-1" },     
];

export function getBreakpoint(width: number) {
  return BREAKPOINTS.find((bp) => width >= bp.minWidth) ?? BREAKPOINTS[BREAKPOINTS.length - 1];
}
