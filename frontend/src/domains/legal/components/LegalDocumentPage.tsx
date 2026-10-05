import Link from "next/link";
import type { LegalPage } from "@/domains/cms/lib/types";
import CmsHtmlContent from "@/domains/cms/ui/CmsHtmlContent";
import Typography from "@/lib/Typography";

type LegalDocumentPageProps = {
  document: LegalPage | null;
  fallbackTitle: string;
  emptyMessage: string;
};

function formatUpdatedAt(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LegalDocumentPage({
  document,
  fallbackTitle,
  emptyMessage,
}: LegalDocumentPageProps) {
  const title = document?.title?.trim() || fallbackTitle;
  const updated = formatUpdatedAt(document?.updatedAt);

  return (
    // From sm up the navbar floats over the page (top offset + bar height), so
    // the top padding clears it before adding breathing room.
    <section className="min-h-screen bg-[#FFF6D8] px-8 py-12 text-[#382E07] sm:px-12 sm:pt-[calc(clamp(0.75rem,2vw,1.5rem)_+_clamp(3.5rem,6vw,4.5rem)_+_3rem)] md:px-16 lg:px-6 lg:pb-16 xl:px-6 xl:pb-20 2xl:px-40">
      <div className="mx-auto max-w-3xl">
        <Typography
          variant="heading-3"
          as="h1"
          className="font-tiempos-headline font-medium text-[#382E07]"
        >
          {title}
        </Typography>

        {updated ? (
          <Typography
            variant="label-1"
            as="p"
            className="mt-3 text-[#9A7B00]"
          >
            Last updated {updated}
          </Typography>
        ) : null}

        <div className="mt-8 h-px w-full bg-[#FCCC2D]/60" />

        {document?.content?.trim() ? (
          <CmsHtmlContent
            html={document.content}
            className="mt-8 [&_h1]:!text-[#382E07] [&_h2]:!text-[#382E07] [&_h3]:!text-[#382E07]"
          />
        ) : (
          <div className="mt-10 space-y-4">
            <Typography
              variant="body-8"
              as="p"
              className="leading-relaxed text-[#5C5C5C]"
            >
              {emptyMessage}
            </Typography>
            <Link
              href="/"
              className="inline-flex text-[#9A7B00] underline-offset-2 hover:underline"
            >
              <Typography variant="label-1" as="span" className="font-medium text-[#9A7B00]">
                ← Back to home
              </Typography>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
