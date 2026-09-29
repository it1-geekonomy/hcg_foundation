"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { FundraisingCampaign } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsDetailCard,
  CmsDetailRow,
  CmsRecordActions,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
  formatCmsDateTime,
} from "@/domains/cms/ui/CmsViewChrome";

function formatGoal(amount: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export default function FundraisingCampaignViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<FundraisingCampaign | null>(null);
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
        const res = await cmsApi.getFundraisingCampaign(id);
        if (!cancelled) setCampaign(res.data);
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

  const isDeleted = Boolean(campaign?.deletedAt);

  const onDelete = async () => {
    if (!campaign) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${campaign.fullName}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteFundraisingCampaign(campaign.id);
      cmsToast.success(res?.message || "Campaign deleted successfully");
      router.replace("/admin/campaigns");
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!campaign) return;
    const ok = await cmsConfirm({
      title: "Restore campaign?",
      description: `“${campaign.fullName}” will be restored and show again in All campaigns.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreFundraisingCampaign(campaign.id);
      cmsToast.success(res.message || "Campaign restored successfully");
      setCampaign(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading campaign…" />;
  if (error || !campaign) {
    return (
      <CmsViewError
        backHref="/admin/campaigns"
        message={error || "Campaign not found"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/campaigns"
        title={campaign.fullName}
        badges={
          <>
            <CmsBadge>{campaign.status}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={`Goal ${formatGoal(campaign.fundraisingGoal)}${campaign.city ? ` · ${campaign.city}` : ""}`}
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`/admin/campaigns/${campaign.id}/edit`}
            onDelete={() => void onDelete()}
            onRestore={() => void onRestore()}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CmsDetailCard title="Fundraiser">
          <dl>
            <CmsDetailRow label="Email" value={campaign.email} />
            <CmsDetailRow label="Phone" value={campaign.phoneNumber} />
            <CmsDetailRow label="City" value={campaign.city} />
            <CmsDetailRow
              label="Terms accepted"
              value={campaign.termsAccepted ? "Yes" : "No"}
            />
          </dl>
        </CmsDetailCard>

        <CmsDetailCard title="Campaign">
          <dl>
            <CmsDetailRow
              label="Fundraising goal"
              value={formatGoal(campaign.fundraisingGoal)}
            />
            <CmsDetailRow
              label="Status"
              value={<span className="capitalize">{campaign.status}</span>}
            />
            <CmsDetailRow label="Submitted" value={formatCmsDateTime(campaign.createdAt)} />
            <CmsDetailRow label="Updated" value={formatCmsDateTime(campaign.updatedAt)} />
            {isDeleted ? (
              <CmsDetailRow
                label="Deleted at"
                value={formatCmsDateTime(campaign.deletedAt)}
              />
            ) : null}
          </dl>
        </CmsDetailCard>
      </div>

      <CmsDetailCard title="Story">
        <dl>
          <CmsDetailRow label="Reason" value={campaign.fundraisingReason} />
          <CmsDetailRow label="Message" value={campaign.message} />
        </dl>
      </CmsDetailCard>
    </div>
  );
}
