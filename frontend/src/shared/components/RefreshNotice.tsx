"use client";

import { useRouter } from "next/navigation";
import ContentNotice, { LOAD_ERROR_MESSAGE } from "./ContentNotice";

/** Error notice for server-rendered pages: "Try again" re-runs the page's data fetch. */
export default function RefreshNotice({
  title,
  message = LOAD_ERROR_MESSAGE,
  className,
}: {
  title: string;
  message?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <ContentNotice
      tone="error"
      title={title}
      message={message}
      action={{ label: "Try again", onClick: () => router.refresh() }}
      className={className}
    />
  );
}
