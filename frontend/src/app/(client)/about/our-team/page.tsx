import { publicTeamsApi } from "@/domains/cms/lib/api";
import { SectionHeading } from "@/domains/about/components/SectionHeading";
import TeamMemberCard from "@/domains/about/components/TeamMemberCard";

function plainText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function OurTeamPage() {
  let trustees: Array<{
    id: string;
    name: string;
    designation?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    href: string;
  }> = [];

  let teamMembers: typeof trustees = [];
  let error: string | null = null;

  try {
    const [trusteesRes, teamRes] = await Promise.all([
      publicTeamsApi.listPublished({ limit: 50, memberType: "trustee" }),
      publicTeamsApi.listPublished({ limit: 50, memberType: "team" }),
    ]);

    trustees = (trusteesRes.data ?? []).map((m) => ({
      id: m.id,
      name: m.title,
      designation: m.designation,
      imageUrl: m.teamImage,
      description: plainText(m.content) || plainText(m.shortDescription),
      href: `/about/our-team/${m.id}`,
    }));

    teamMembers = (teamRes.data ?? []).map((m) => ({
      id: m.id,
      name: m.title,
      designation: m.designation,
      imageUrl: m.teamImage,
      description: plainText(m.content) || plainText(m.shortDescription),
      href: `/about/our-team/${m.id}`,
    }));
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load team";
  }

  return (
    <section className="min-h-screen bg-[#F3EEE3] px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <p className="text-center font-manrope text-sm text-red-600">{error}</p>
        ) : null}

        {!error && trustees.length === 0 && teamMembers.length === 0 ? (
          <p className="text-center font-manrope text-sm text-[#5C5C5C]">
            No published members yet. Add a trustee or team member in CMS with
            status <strong>published</strong>.
          </p>
        ) : null}

        {trustees.length > 0 ? (
          <div>
            <SectionHeading>Trustees</SectionHeading>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
              {trustees.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  href={member.href}
                  name={member.name}
                  designation={member.designation}
                  imageUrl={member.imageUrl}
                  description={member.description}
                  variant="trustee"
                />
              ))}
            </div>
          </div>
        ) : null}

        {teamMembers.length > 0 ? (
          <div className={trustees.length > 0 ? "mt-16 sm:mt-20" : undefined}>
            <SectionHeading>Team</SectionHeading>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:gap-6">
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  href={member.href}
                  name={member.name}
                  designation={member.designation}
                  imageUrl={member.imageUrl}
                  description={member.description}
                  variant="team"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
