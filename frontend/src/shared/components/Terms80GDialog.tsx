"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck, X } from "lucide-react";
import {
  SECTION_80G_ACT,
  SECTION_80G_FULL_TEXT_HEADING,
  SECTION_80G_KEY_POINTS,
  SECTION_80G_NOTES,
  SECTION_80G_SUBTITLE,
  SECTION_80G_TEXT,
  SECTION_80G_TITLE,
  type Section80GBlock,
} from "@/shared/lib/section80G";

/** Hanging indent per nesting level; phones get a tighter step so deep provisos keep a readable column. */
const INDENT_CLASS = [
  "",
  "pl-3 sm:pl-6",
  "pl-6 sm:pl-12",
  "pl-8 sm:pl-[4.5rem]",
  "pl-10 sm:pl-24",
  "pl-12 sm:pl-[7.5rem]",
];

function SectionBlock({ block }: { block: Section80GBlock }) {
  const isTopLevel = block.depth === 0;
  const isNote = block.tone === "note";
  const isOmitted = block.tone === "omitted";

  return (
    <div
      className={`${INDENT_CLASS[Math.min(block.depth, INDENT_CLASS.length - 1)]} ${
        isTopLevel && !isNote ? "mt-5 first:mt-0" : isTopLevel ? "mt-4" : "mt-2"
      }`}
    >
      <div className="flex gap-2 sm:gap-3">
        {block.label ? (
          <span
            className={`shrink-0 font-manrope tabular-nums ${
              isTopLevel
                ? "min-w-8 font-bold text-[#8A6500] sm:min-w-10"
                : "min-w-8 font-semibold text-[#6B5A2E] sm:min-w-11"
            }`}
          >
            {block.label}
          </span>
        ) : null}
        <p
          className={`min-w-0 flex-1 font-manrope leading-relaxed ${
            isOmitted
              ? "italic text-[#8C8476]"
              : isNote
                ? "text-[#4F4A42]"
                : isTopLevel
                  ? "text-[#2A2620]"
                  : "text-[#3B3731]"
          }`}
        >
          {block.lead ? (
            <span className="font-semibold text-[#2A2620]">{block.lead}</span>
          ) : null}
          {block.text}
        </p>
      </div>
    </div>
  );
}

type Terms80GDialogProps = {
  open: boolean;
  onClose: () => void;
  /** When provided, the footer offers "I Agree", which should tick the form's 80G checkbox. */
  onAgree?: () => void;
};

export function Terms80GDialog({ open, onClose, onAgree }: Terms80GDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    setProgress(0);
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      html.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const onScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 1);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="terms-80g"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#16130d]/65 p-3 backdrop-blur-[3px] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          // The dialog is portalled, but React still bubbles its events to the form that opened it.
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-80g-title"
            aria-describedby="terms-80g-subtitle"
            className="relative flex max-h-[min(88dvh,52rem)] w-full max-w-[44rem] flex-col overflow-hidden rounded-xl bg-[#FFFCF4] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <header className="relative shrink-0 border-b border-[#EADFC2] bg-[#FFF6DA] px-5 pt-5 pb-4 sm:px-8 sm:pt-6">
              <div className="flex items-start gap-3 pr-10 sm:gap-4">
                <span className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D]/30 text-[#8A6500] sm:flex">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="font-manrope text-[11px] font-semibold tracking-[0.14em] text-[#8A6500] uppercase">
                    {SECTION_80G_ACT}
                  </p>
                  <h2
                    id="terms-80g-title"
                    className="mt-1 font-manrope text-lg leading-tight font-bold text-[#1F1B14] sm:text-xl"
                  >
                    {`${SECTION_80G_TITLE} — Terms & Conditions`}
                  </h2>
                  <p
                    id="terms-80g-subtitle"
                    className="mt-1 font-manrope text-[13px] leading-snug text-[#5E574B] sm:text-sm"
                  >
                    {SECTION_80G_SUBTITLE}
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close 80G terms"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-[#4A4337] transition-colors hover:bg-[#F1E4BD] focus-visible:ring-2 focus-visible:ring-[#FCCC2D] focus-visible:outline-none sm:top-5 sm:right-5"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#FCCC2D] transition-transform duration-150"
                style={{ transform: `scaleX(${progress})` }}
              />
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                ref={bodyRef}
                onScroll={onScroll}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-[13.5px] [scrollbar-width:none] sm:px-8 sm:py-6 sm:text-sm [&::-webkit-scrollbar]:hidden"
              >
                <section
                  aria-labelledby="terms-80g-summary"
                  className="rounded-lg border border-[#F0DC9A] bg-[#FFF3C9]/60 p-4 sm:p-5"
                >
                  <h3
                    id="terms-80g-summary"
                    className="font-manrope text-sm font-bold text-[#1F1B14] sm:text-[15px]"
                  >
                    What this means for your donation
                  </h3>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {SECTION_80G_KEY_POINTS.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D]">
                          <Check className="h-2.5 w-2.5 text-[#3A2E00]" strokeWidth={3.5} />
                        </span>
                        <span className="font-manrope leading-relaxed text-[#3B3731]">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-[#F0DC9A] pt-3">
                    {SECTION_80G_NOTES.map((note) => (
                      <p key={note} className="font-manrope text-[12.5px] leading-relaxed text-[#6B6355] sm:text-[13px]">
                        {note}
                      </p>
                    ))}
                  </div>
                </section>

                <div className="mt-7 flex items-center gap-3">
                  <h3 className="shrink-0 font-manrope text-sm font-bold text-[#1F1B14] sm:text-[15px]">
                    {SECTION_80G_FULL_TEXT_HEADING}
                  </h3>
                  <span aria-hidden="true" className="h-px flex-1 bg-[#EADFC2]" />
                </div>

                <div className="mt-4">
                  {SECTION_80G_TEXT.map((block, i) => (
                    <SectionBlock key={i} block={block} />
                  ))}
                </div>
              </div>
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FFFCF4] to-transparent transition-opacity duration-200 ${
                  progress >= 0.995 ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#EADFC2] bg-[#FFFCF4] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-5 py-2.5 font-manrope text-sm font-semibold text-[#4A4337] transition-colors hover:bg-[#F4ECD6]"
              >
                Close
              </button>
              {onAgree ? (
                <button
                  type="button"
                  onClick={() => {
                    onAgree();
                    onClose();
                  }}
                  className="rounded-md bg-[#FCCC2D] px-6 py-2.5 font-manrope text-sm font-bold text-[#2A2200] shadow-sm transition-colors hover:bg-[#FFD84F]"
                >
                  I Agree
                </button>
              ) : null}
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Inline "80G Terms & Conditions" trigger for use inside the consent checkbox label.
 * Clicking it opens the terms instead of toggling the checkbox.
 */
export function Terms80GLink({
  className,
  onAgree,
  children = <>80G Terms &amp; Conditions</>,
}: {
  className?: string;
  onAgree?: () => void;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className={`inline cursor-pointer underline decoration-current/40 decoration-1 underline-offset-[3px] transition-colors hover:decoration-current focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#FCCC2D]/60 focus-visible:outline-none ${className ?? ""}`}
      >
        {children}
      </button>
      <Terms80GDialog open={open} onClose={() => setOpen(false)} onAgree={onAgree} />
    </>
  );
}
