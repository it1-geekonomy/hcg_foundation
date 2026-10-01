import Link from "next/link";
import { CloudOff, type LucideIcon } from "lucide-react";
import Typography from "@/lib/Typography";

export type ContentNoticeAction =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

type ContentNoticeProps = {
  /** "error" is announced to assistive tech immediately; "empty" politely. */
  tone?: "empty" | "error";
  icon?: LucideIcon;
  title: string;
  message: string;
  action?: ContentNoticeAction;
  headingAs?: "h1" | "h2" | "h3";
  className?: string;
};

const ACTION_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#FCCC2D] px-6 py-2.5 font-manrope text-sm font-semibold text-[#1F1F1F] transition-colors hover:bg-[#FDC61D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A7B00]/50 focus-visible:ring-offset-2";

/** Visitor-facing message for sections whose content is empty or failed to load. */
export default function ContentNotice({
  tone = "empty",
  icon,
  title,
  message,
  action,
  headingAs = "h2",
  className = "",
}: ContentNoticeProps) {
  const Icon = icon ?? CloudOff;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`mx-auto flex w-full max-w-xl flex-col items-center px-4 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="mb-5 flex size-14 items-center justify-center rounded-full bg-[#FCCC2D]/15 text-[#9A7B00] ring-1 ring-[#FCCC2D]/40"
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <Typography variant="heading-5" as={headingAs} className="text-[#0D2838]">
        {title}
      </Typography>
      <Typography variant="body-10" as="p" className="mt-3 text-[#596D79]">
        {message}
      </Typography>
      {action ? (
        <div className="mt-6">
          {"href" in action ? (
            <Link href={action.href} className={ACTION_CLASS}>
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className={ACTION_CLASS}>
              {action.label}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Shared copy so every failed section reads the same way. */
export const LOAD_ERROR_MESSAGE =
  "Something interrupted the connection. Please try again in a moment.";
