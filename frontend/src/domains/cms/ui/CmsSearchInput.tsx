"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";

const DEFAULT_DELAY_MS = 400;

/** Debounce any value — useful outside search inputs too. */
export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_DELAY_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

type CmsSearchInputProps = {
  /** Committed (debounced) value from the parent — used to sync clears / resets. */
  value: string;
  /** Fires after typing pauses for `delayMs`. */
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  delayMs?: number;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
};

/**
 * CMS search field with local typing state and debounced commit.
 * Parent should drive API loads from `value` / `onDebouncedChange`.
 */
export default function CmsSearchInput({
  value,
  onDebouncedChange,
  placeholder = "Search…",
  className,
  inputClassName,
  delayMs = DEFAULT_DELAY_MS,
  disabled,
  id,
  "aria-label": ariaLabel,
}: CmsSearchInputProps) {
  const [draft, setDraft] = useState(value);
  const onChangeRef = useRef(onDebouncedChange);
  onChangeRef.current = onDebouncedChange;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => {
      onChangeRef.current(draft);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [draft, delayMs, value]);

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#8A8A8A]"
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        disabled={disabled}
        placeholder={placeholder}
        value={draft}
        aria-label={ariaLabel ?? placeholder}
        onChange={(e) => setDraft(e.target.value)}
        className={cn("w-full pl-8", inputClassName)}
      />
    </div>
  );
}
