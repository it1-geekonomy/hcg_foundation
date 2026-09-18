"use client";

import Typography from "@/lib/Typography";
import type { Person } from "@/domains/about/constants/teams";
import { ArrowScrollCarousel } from "./ArrowScrollCarousel";
import { PersonCard } from "./PersonCard";
import { TeamCarousel } from "./TeamCarousel";
import { personKey } from "./team-utils";
import { useSyncedLabelHeight } from "./useSyncedLabelHeight";

export type TeamSectionProps = {
  trustees?: Person[];
  teamMembers?: Person[];
};

function chunkPeople(people: Person[], size: number): Person[][] {
  if (people.length === 0) return [];
  const rows: Person[][] = [];
  for (let i = 0; i < people.length; i += size) {
    rows.push(people.slice(i, i + size));
  }
  return rows;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mx-auto mb-4 flex max-w-[1260px] items-center justify-center gap-4 md:gap-[22px] lg:mb-24">
      <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-l from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
      <Typography
        variant="heading-6"
        as="span"
        className="whitespace-nowrap font-tiempos-headline text-[#382E07]"
      >
        {label}
      </Typography>
      <span className="h-px w-full max-w-[3.75rem] bg-gradient-to-r from-[#635612] to-[#FEF2C9]/[0.41] md:max-w-[16.25rem]" />
    </div>
  );
}

export default function TeamSection({
  trustees,
  teamMembers,
}: TeamSectionProps) {
  const allTrustees = trustees ?? [];
  const teamPeople = teamMembers ?? [];
  const trusteeRowsLg = chunkPeople(allTrustees, 3);

  const { setRef: setTrusteeLabelRef, height: trusteeLabelHeight } =
    useSyncedLabelHeight(allTrustees.length);
  const { setRef: setTeamGridLabelRef, height: teamGridLabelHeight } =
    useSyncedLabelHeight(teamPeople.length);

  return (
    <section className="bg-[#FFF6D8] px-8 pt-6 pb-6 sm:px-12 md:px-16 lg:px-6 lg:py-10 xl:px-6 xl:py-20">
      <div className="mx-auto mb-12 flex flex-col gap-5 lg:mb-16 lg:flex-row lg:items-start lg:justify-between lg:gap-[60px] 2xl:px-40">
        <div className="flex items-stretch gap-5">
          <span className="w-[3px] flex-none rounded-full bg-[#FCCC2D]" />
          <Typography
            variant="heading-2"
            as="h1"
            className="font-tiempos-headline text-[#382E07]"
          >
            Meet the People <br className="hidden lg:block" />
            Behind the Mission
          </Typography>
        </div>
        <Typography
          variant="body-3"
          as="p"
          className="w-full font-argestadisplay text-[#596D79] lg:max-w-md"
        >
          A dedicated team working together to advance cancer awareness,
          support patients, and build healthier communities through compassion,
          collaboration, and meaningful impact.
        </Typography>
      </div>

      {allTrustees.length > 0 ? (
        <>
          <SectionLabel label="Trustees" />
          <div className="mb-4 lg:hidden">
            <ArrowScrollCarousel people={allTrustees} />
          </div>
          <div className="mx-auto mb-16 hidden max-w-[1260px] flex-col gap-16 md:mb-24 lg:flex">
            {trusteeRowsLg.map((row, rowIndex) => {
              const offset = rowIndex * 3;
              return (
                <div
                  key={`trustee-row-${rowIndex}`}
                  className="flex flex-wrap justify-center gap-[1.875rem]"
                >
                  {row.map((p, i) => (
                    <PersonCard
                      key={personKey(p, offset + i)}
                      {...p}
                      labelRef={setTrusteeLabelRef(offset + i)}
                      labelHeight={trusteeLabelHeight}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {teamPeople.length > 0 ? (
        <>
          <SectionLabel label="Teams" />
          <div className="lg:hidden">
            <ArrowScrollCarousel people={teamPeople} />
          </div>
          <div className="hidden lg:block 2xl:hidden">
            <TeamCarousel people={teamPeople} />
          </div>
          <div className="hidden grid-cols-4 justify-items-center gap-30 px-20 2xl:grid 3xl:gap-20 3xl:px-50">
            {teamPeople.map((p, i) => (
              <PersonCard
                key={personKey(p, i)}
                {...p}
                labelRef={setTeamGridLabelRef(i)}
                labelHeight={teamGridLabelHeight}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
