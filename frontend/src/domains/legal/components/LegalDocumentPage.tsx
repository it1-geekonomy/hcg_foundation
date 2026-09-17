import Link from "next/link";
import type { LegalPage } from "@/domains/cms/lib/types";
import CmsHtmlContent from "@/domains/cms/components/CmsHtmlContent";
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
    <section className="min-h-screen bg-[#FFF6D8] px-8 py-12 text-[#382E07] sm:px-12 md:px-16 lg:px-6 lg:py-16 xl:px-6 xl:py-20 2xl:px-40">
      <div className="mx-auto max-w-3xl">
        <Typography
          variant="caption-1"
          as="p"
          className="mb-3 font-semibold tracking-[0.18em] text-[#6F5E09] uppercase"
        >
          HCG Foundation
        </Typography>

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
