import Typography from "@/lib/Typography";
import type { Donor } from "@/domains/cms/lib/types";
import { CmsBadge, formatCmsDateTime } from "@/domains/cms/ui/CmsViewChrome";

type Props = Pick<
  Donor,
  | "receiptEmailStatus"
  | "receiptEmailNextAttemptAt"
  | "receiptEmailSentAt"
  | "receiptEmailError"
  | "receiptEmailAttempts"
>;

function isFuture(value?: string | null) {
  return !!value && new Date(value).getTime() > Date.now();
}

/** Badge for the receipt email, with a one-line hint (when it was sent, when it will go out, why it failed). */
export default function ReceiptEmailStatus({
  receiptEmailStatus: status,
  receiptEmailNextAttemptAt: nextAt,
  receiptEmailSentAt: sentAt,
  receiptEmailError: error,
  receiptEmailAttempts: attempts,
}: Props) {
  let badge;
  let hint: string | null = null;

  switch (status) {
    case "sent":
      badge = <CmsBadge tone="success">Sent</CmsBadge>;
      hint = sentAt ? formatCmsDateTime(sentAt) : null;
      break;
    case "queued":
      badge = <CmsBadge tone="status">Queued</CmsBadge>;
      hint = isFuture(nextAt)
        ? `Sends ${formatCmsDateTime(nextAt)}`
        : "Sending shortly";
      break;
    case "sending":
      badge = <CmsBadge tone="info">Sending…</CmsBadge>;
      break;
    case "failed":
      badge = <CmsBadge tone="danger">Failed</CmsBadge>;
      hint = attempts ? `After ${attempts} attempts` : null;
      break;
    case "skipped":
      badge = <span className="text-xs font-medium text-cms-muted">No email</span>;
      break;
    default:
      return <span className="text-cms-muted">—</span>;
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5" title={error ?? undefined}>
      {badge}
      {hint ? (
        <Typography variant="caption-1" as="span" className="whitespace-nowrap text-cms-muted">
          {hint}
        </Typography>
      ) : null}
    </span>
  );
}
