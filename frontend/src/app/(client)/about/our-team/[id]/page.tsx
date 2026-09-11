import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicTeamsApi } from "@/domains/cms/lib/api";
import CmsHtmlContent from "@/domains/cms/components/CmsHtmlContent";
import Typography from "@/lib/Typography";

type Params = Promise<{ id: string }>;

export default async function OurTeamMemberPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  let member;
  try {
    const res = await publicTeamsApi.getById(id);
    member = res.data;
  } catch {
    notFound();
  }

  if (!member || member.status !== "published") {
    notFound();
  }

  return (
    <section className="min-h-screen bg-[#F7F7F5] px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div>
          <Link
            href="/about/our-team"
            className="mb-6 inline-flex font-manrope text-sm text-[#9A7B00] underline-offset-2 hover:underline"
          >
            ← Back to Our Team
          </Link>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#EDEDED] ring-1 ring-black/5">
            {member.teamImage ? (
              <Image
                src={member.teamImage}
                alt={member.title}
                fill
                className="object-cover"
                sizes="280px"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-manrope text-sm text-[#9A9A9A]">
                No photo
              </div>
            )}
          </div>
        </div>

        <div>
          <Typography
            variant="heading-3"
            as="h1"
            className="text-[#382E07]"
          >
            {member.title}
          </Typography>
          {member.designation ? (
            <p className="mt-2 font-manrope text-base font-medium text-[#9A7B00]">
              {member.designation}
            </p>
          ) : null}
          {member.shortDescription ? (
            <p className="mt-4 font-manrope text-base text-[#5C5C5C]">
              {member.shortDescription}
            </p>
          ) : null}
          {member.content ? (
            <CmsHtmlContent html={member.content} className="mt-8" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
