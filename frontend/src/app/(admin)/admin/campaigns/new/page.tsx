import { redirect } from "next/navigation";

/** Campaigns are submitted from the public website — no CMS create. */
export default function AdminCampaignsNewPage() {
  redirect("/admin/campaigns");
}
