export interface Report {
  title: string;
  description: string;
  pages: string;
  pdfUrl: string;
}
export const REPORTS: Report[] = [
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
   {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024–25",
    description: "Our performance, initiatives, and impact in 2024–25.",
    pages: "128 Pages",
    pdfUrl: "/reports/annual-report-2024-25.pdf",
  },
];
export const BREAKPOINTS = [
  { minWidth: 1280, perPage: 12, cols: "grid-cols-4" }, 
  { minWidth: 1024, perPage: 9, cols: "grid-cols-3" }, 
  { minWidth: 640, perPage: 6, cols: "grid-cols-2" },   
  { minWidth: 0, perPage: 3, cols: "grid-cols-1" },     
];

export function getBreakpoint(width: number) {
  return BREAKPOINTS.find((bp) => width >= bp.minWidth) ?? BREAKPOINTS[BREAKPOINTS.length - 1];
}
