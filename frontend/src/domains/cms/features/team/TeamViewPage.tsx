"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import { PersonCard } from "@/domains/about/components/team";
import { mapTeamToPerson } from "@/domains/about/constants/teams";
import { cmsApi } from "@/domains/cms/lib/api";
import type { Team } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
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
        const res = await cmsApi.getTeam(id);
        if (!cancelled) setTeam(res.data);
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

  const person = mapTeamToPerson(team);
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

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl bg-[#FFF6D8] p-6 sm:p-8">
          <Typography
            variant="caption-1"
            as="p"
            className="mb-2 text-center font-semibold tracking-[0.16em] text-[#8A7A55] uppercase"
          >
            Website preview · {isTrustee ? "Trustee" : "Team"} card
          </Typography>
          <Typography
            variant="caption-1"
            as="p"
            className="mb-8 text-center text-[#9A9A9A]"
          >
            Same flip card visitors see on About Us — click the arrow to open
          </Typography>
          <div className="mx-auto flex justify-center pt-10">
            <PersonCard {...person} />
          </div>
        </div>

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
    </div>
  );
}
