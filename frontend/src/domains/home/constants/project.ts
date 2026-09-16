export type CardData = {
  id?: string;
  number: string;
  title: string;
  date: string;
  description: string;
  image: string;
  href?: string;
};

export const COLLAPSED_WIDTH = 130;

export function formatProjectCardDate(value?: string | null): string {
  if (!value?.trim()) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapProjectToCard(
  project: {
    id?: string;
    title: string;
    slug?: string;
    projectBanner?: string | null;
    projectMobileBanner?: string | null;
    projectDate?: string | null;
    shortDescription?: string | null;
    displayOrder?: number | null;
  },
  index: number
): CardData {
  return {
    id: project.id,
    number: String(project.displayOrder ?? index + 1),
    title: project.title,
    date: formatProjectCardDate(project.projectDate),
    description: project.shortDescription?.trim() || "No description yet.",
    image:
      project.projectBanner?.trim() ||
      project.projectMobileBanner?.trim() ||
      "",
    href: project.slug ? `/resources/projects/${project.slug}` : undefined,
  };
}
