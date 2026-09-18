"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Typography from "@/lib/Typography";
import TeamSection from "@/domains/about/components/team";
import { mapTeamToPerson } from "@/domains/about/constants/teams";
import { cmsApi, publicTeamsApi } from "@/domains/cms/lib/api";
import type { Team } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import CmsWebsitePreview from "@/domains/cms/ui/CmsWebsitePreview";
import {
  CmsBadge,
  CmsHtmlContentCard,
  CmsRecordActions,
  CmsSeoCard,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

const LIST_HREF = "/admin/team";

export default function TeamViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [publishedTrustees, setPublishedTrustees] = useState<Team[]>([]);
  const [publishedTeam, setPublishedTeam] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [res, trusteesRes, teamRes] = await Promise.all([
          cmsApi.getTeam(id),
          publicTeamsApi
            .listPublished({ limit: 50, type: "trustee" })
            .catch(() => null),
          publicTeamsApi
            .listPublished({ limit: 50, type: "team" })
            .catch(() => null),
        ]);
        if (cancelled) return;
        setTeam(res.data);
        setPublishedTrustees(trusteesRes?.data ?? []);
        setPublishedTeam(teamRes?.data ?? []);
      } catch (err) {
        if (cancelled) return;
        const message = cmsErrorMessage(err, "Failed to load");
        setError(message);
        cmsToast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const { trustees, teamMembers } = useMemo(() => {
    if (!team) return { trustees: [], teamMembers: [] };

    const isTrustee = team.type === "trustee";

    const merge = (list: Team[], current: Team) => {
      const others = list
        .filter((m) => m.id !== current.id)
        .map(mapTeamToPerson);
      return [mapTeamToPerson(current), ...others];
    };

    if (isTrustee) {
      return {
        trustees: merge(publishedTrustees, team),
        teamMembers: publishedTeam.map(mapTeamToPerson),
      };
    }

    return {
      trustees: publishedTrustees.map(mapTeamToPerson),
      teamMembers: merge(publishedTeam, team),
    };
  }, [team, publishedTrustees, publishedTeam]);

  const onDelete = async () => {
    if (!team) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${team.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteTeam(team.id);
      cmsToast.success(res?.message || "Team member deleted successfully");
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading member…" />;
  if (error || !team) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Member not found"}
      />
    );
  }

  const isTrustee = team.type === "trustee";

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={team.title}
        badges={
          <>
            <CmsBadge tone="info">
              <span className="capitalize">{team.type ?? "team"}</span>
            </CmsBadge>
            <CmsBadge>{team.status}</CmsBadge>
          </>
        }
        meta={
          team.designation ? (
            <Typography
              variant="label-1"
              as="p"
              className="mt-1 text-[#9A7B00]"
            >
              {team.designation}
            </Typography>
          ) : null
        }
        actions={
          <CmsRecordActions
            isDeleted={false}
            busy={busy}
            editHref={`${LIST_HREF}/${team.id}/edit`}
            onDelete={onDelete}
          />
        }
      />

      <CmsWebsitePreview
        label={`Website preview · About Us · ${isTrustee ? "Trustees" : "Teams"}`}
        className="bg-[#FFF6D8]"
      >
        <TeamSection trustees={trustees} teamMembers={teamMembers} />
      </CmsWebsitePreview>

      <div className="space-y-4">
        <CmsHtmlContentCard
          html={team.content}
          empty="No content yet — add it in Edit (TinyMCE)."
        />
        <CmsSeoCard
          metaTitle={team.metaTitle}
          metaDescription={team.metaDescription}
          schemaCode={team.schemaCode}
        />
      </div>
    </div>
  );
}
