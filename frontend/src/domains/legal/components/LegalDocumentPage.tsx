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
        <p className="mb-3 font-manrope text-xs font-semibold tracking-[0.18em] text-[#6F5E09] uppercase">
          HCG Foundation
        </p>

        <Typography
          variant="heading-3"
          as="h1"
          className="font-tiempos-headline font-medium text-[#382E07]"
        >
          {title}
        </Typography>

        {updated ? (
          <p className="mt-3 font-manrope text-sm text-[#9A7B00]">
            Last updated {updated}
          </p>
        ) : null}

        <div className="mt-8 h-px w-full bg-[#FCCC2D]/60" />

        {document?.content?.trim() ? (
          <CmsHtmlContent
            html={document.content}
            className="mt-8 [&_h1]:!text-[#382E07] [&_h2]:!text-[#382E07] [&_h3]:!text-[#382E07]"
          />
        ) : (
          <div className="mt-10 space-y-4">
            <p className="font-manrope text-base leading-relaxed text-[#5C5C5C]">
              {emptyMessage}
            </p>
            <Link
              href="/"
              className="inline-flex font-manrope text-sm font-medium text-[#9A7B00] underline-offset-2 hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
