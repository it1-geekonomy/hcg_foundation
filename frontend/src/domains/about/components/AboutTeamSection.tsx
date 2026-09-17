"use client";

import { useEffect, useState } from "react";
import { publicTeamsApi } from "@/domains/cms/lib/api";
import TeamSection from "@/domains/about/components/teamsection";
import {
  mapTeamToPerson,
  type Person,
} from "@/domains/about/constants/teams";
import Typography from "@/lib/Typography";

function sortOldestFirst<T extends { createdAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });
}

/**
 * About Us team block — loads published trustees + team from CMS only.
 * No static / dummy people or photos.
 */
export default function AboutTeamSection() {
  const [trustees, setTrustees] = useState<Person[]>([]);
  const [teamMembers, setTeamMembers] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trusteesRes, teamRes] = await Promise.all([
          publicTeamsApi.listPublished({ limit: 50, type: "trustee" }),
          publicTeamsApi.listPublished({ limit: 50, type: "team" }),
        ]);

        if (cancelled) return;

        setTrustees(
          sortOldestFirst(trusteesRes.data ?? []).map(mapTeamToPerson)
        );
        setTeamMembers(
          sortOldestFirst(teamRes.data ?? []).map(mapTeamToPerson)
        );
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setTrustees([]);
          setTeamMembers([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load team members"
          );
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <section className="bg-[#FFF6D8] px-8 py-16 sm:px-12 md:px-16 lg:px-6 xl:px-6">
        <div className="mx-auto h-[420px] max-w-[1260px] animate-pulse rounded-2xl bg-[#FFE9A8]/50" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FFF6D8] px-8 py-16 sm:px-12 md:px-16 lg:px-6 xl:px-6">
        <Typography
          variant="label-1"
          as="div"
          className="mx-auto max-w-[1260px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error}
        </Typography>
      </section>
    );
  }

  if (trustees.length === 0 && teamMembers.length === 0) {
    return (
      <section className="bg-[#FFF6D8] px-8 py-16 sm:px-12 md:px-16 lg:px-6 xl:px-6">
        <Typography
          variant="label-1"
          as="div"
          className="mx-auto max-w-[1260px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
        >
          No published trustees or team members yet. Add them in CMS with status
          published.
        </Typography>
      </section>
    );
  }

  return <TeamSection trustees={trustees} teamMembers={teamMembers} />;
}
