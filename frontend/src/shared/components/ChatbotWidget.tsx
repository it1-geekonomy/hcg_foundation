"use client";

import {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseMedical,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Contact,
  ExternalLink,
  HandHelping,
  Heart,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { ChatbotApiError, chatbotApi } from "@/shared/lib/chatbot-api";

type ChatRole = "bot" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  at: number;
  sources?: { title: string; url: string }[];
  /** Set on failed replies so the user can resend the same question */
  retryQuestion?: string;
};

type StoredChat = {
  messages: ChatMessage[];
  sessionId?: string;
};

const STORAGE_KEY = "hcg-chatbot-v3";
const TEASER_KEY = "hcg-chatbot-teaser-dismissed";
const AVATAR_SRC = "/chatbot/hope-avatar.webp";
const LOGO_SRC = "/chatbot/hcg-logo-color.svg";
const GREETING = "Hi! I’m Hope 👋\nHow can I help you today?";
/** Must match the backend AskQuestionDto limit */
const MAX_MESSAGE_LENGTH = 1000;

const SUGGESTIONS = [
  { label: "How can I donate?", icon: Heart, iconClass: "fill-[#E5383B] text-[#E5383B]" },
  { label: "What programs do you run?", icon: BriefcaseMedical, iconClass: "text-[#2F80ED]" },
  { label: "How can I volunteer?", icon: HandHelping, iconClass: "text-[#2E9E4F]" },
  { label: "How do I contact HCG Foundation?", icon: Contact, iconClass: "text-[#E8893A]" },
];

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatTime(at: number) {
  return new Date(at)
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
}

/** Drops failed replies together with the question that caused them, so a resend isn't shown twice. */
function withoutFailedTurns(messages: ChatMessage[]) {
  return messages.filter((m, i) => {
    if (m.retryQuestion) return false;
    const next = messages[i + 1];
    return !(m.role === "user" && next?.retryQuestion);
  });
}

function isInternalUrl(url: string) {
  if (url.startsWith("/") || url.startsWith("#")) return true;
  if (typeof window === "undefined") return false;
  try {
    return new URL(url).host === window.location.host;
  } catch {
    return false;
  }
}

function SmartLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "font-semibold text-[#0D2838] underline decoration-[#E9B510] decoration-2 underline-offset-2 hover:decoration-[#0D2838]";
  if (isInternalUrl(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE_PATTERN.lastIndex = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-[#1F1F1F]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("[")) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? [];
      nodes.push(
        <SmartLink key={key} href={href ?? "#"}>
          {label ?? token}
        </SmartLink>,
      );
    } else if (token.includes("@") && !token.startsWith("http")) {
      nodes.push(
        <SmartLink key={key} href={`mailto:${token}`}>
          {token}
        </SmartLink>,
      );
    } else {
      nodes.push(
        <SmartLink key={key} href={token}>
          {token.replace(/^https?:\/\/(www\.)?/, "")}
        </SmartLink>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Renders the light markdown the assistant returns: paragraphs, bullet/numbered lists, bold and links. */
function FormattedText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = (key: string) => {
    if (!list) return;
    const items = list.items.map((item, i) => (
      <li key={`${key}-${i}`} className="pl-0.5">
        {renderInline(item, `${key}-${i}`)}
      </li>
    ));
    blocks.push(
      list.ordered ? (
        <ol key={key} className="list-decimal space-y-1 pl-4 marker:font-semibold marker:text-[#C99A06]">
          {items}
        </ol>
      ) : (
        <ul key={key} className="list-disc space-y-1 pl-4 marker:text-[#C99A06]">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList(`list-${i}`);
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
      return;
    }

    flushList(`list-${i}`);
    if (!line) return;
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    blocks.push(
      <p key={`p-${i}`} className={heading ? "font-semibold text-[#1F1F1F]" : undefined}>
        {renderInline(heading ? heading[1] : line, `p-${i}`)}
      </p>,
    );
  });
  flushList("list-end");

  return <div className="space-y-2">{blocks}</div>;
}

function HopeAvatar({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={AVATAR_SRC}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Launcher avatar framed by two soft yellow halos with an online dot. */
function HopeBadge({ size = 88 }: { size?: number }) {
  const inner = Math.round(size * 0.78);
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <span aria-hidden className="absolute inset-0 rounded-full bg-[#FCE7A0]/55" />
      <span
        className="relative flex items-center justify-center rounded-full bg-[#FDF3D2] ring-2 ring-[#FCE29A]"
        style={{ width: inner, height: inner }}
      >
        <HopeAvatar size={Math.round(inner * 0.84)} />
      </span>
      <span
        aria-hidden
        className="absolute rounded-full bg-[#5CC45C]"
        style={{
          width: Math.round(size * 0.15),
          height: Math.round(size * 0.15),
          right: size * 0.08,
          bottom: size * 0.08,
        }}
      />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <HopeAvatar />
      <div className="flex items-end gap-1 pt-3" aria-label="Hope is typing">
        {[6, 8, 5].map((dot, i) => (
          <motion.span
            key={i}
            className="rounded-full bg-[#FCCC2D]"
            style={{ width: dot, height: dot }}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showTeaser, setShowTeaser] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Saved chat is restored on first open (not during render) to avoid a hydration mismatch
  const restoredRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(TEASER_KEY)) return;
    const timer = window.setTimeout(() => setShowTeaser(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!restoredRef.current) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, sessionId } satisfies StoredChat),
      );
    } catch {
      // storage full or disabled
    }
  }, [messages, sessionId]);

  function restoreChat() {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredChat;
      setMessages(stored.messages ?? []);
      setSessionId(stored.sessionId);
    } catch {
      // ignore corrupt storage
    }
  }

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setInput("");
    requestAnimationFrame(resizeInput);
    setMessages((prev) => {
      const kept = withoutFailedTurns(prev);
      const now = Date.now();
      const greeting: ChatMessage[] =
        kept.length === 0 ? [{ id: newId(), role: "bot", text: GREETING, at: now }] : [];
      return [...greeting, ...kept, { id: newId(), role: "user", text: trimmed, at: now }];
    });
    setLoading(true);

    try {
      const res = await chatbotApi.ask(trimmed, sessionId);
      if (res.data?.session_id) setSessionId(res.data.session_id);
      const answer =
        res.data?.answer?.trim() ||
        "I couldn’t find an answer just now. Please try again, or reach us from the Contact page.";
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "bot",
          text: answer,
          at: Date.now(),
          sources: res.data?.sources ?? [],
        },
      ]);
    } catch (err) {
      const rateLimited = err instanceof ChatbotApiError && err.status === 429;
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "bot",
          text: rateLimited
            ? "You’re sending messages a little too quickly. Please wait a minute, then tap Try again."
            : "I’m having trouble connecting right now. Please check your connection and try again.",
          at: Date.now(),
          retryQuestion: trimmed,
        },
      ]);
    } finally {
      setLoading(false);
      if (!open) setHasUnread(true);
    }
  }

  function retry(message: ChatMessage) {
    if (message.retryQuestion) void sendQuestion(message.retryQuestion);
  }

  function onMessageLinkClick(e: MouseEvent<HTMLDivElement>) {
    const href = (e.target as HTMLElement).closest("a")?.getAttribute("href") ?? "";
    if (href.startsWith("#")) {
      e.preventDefault();
      setOpen(false);
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("/") && window.matchMedia("(max-width: 639px)").matches) {
      // The chat covers the whole screen on mobile, so get out of the way of the new page
      setOpen(false);
    }
  }

  function resetChat() {
    setMessages([]);
    setSessionId(undefined);
    setInput("");
    inputRef.current?.focus();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendQuestion(input);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void sendQuestion(input);
    }
  }

  function toggle() {
    dismissTeaser();
    restoreChat();
    setHasUnread(false);
    setOpen((prev) => !prev);
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="hcg-chatbot-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#FBF8EC] sm:inset-auto sm:right-6 sm:bottom-[148px] sm:h-[min(660px,calc(100dvh-11rem))] lg:bottom-[132px] sm:w-[420px] sm:rounded-[28px] sm:shadow-[0_24px_60px_-16px_rgba(60,48,10,0.35)] sm:ring-1 sm:ring-black/5"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 bg-[linear-gradient(100deg,#CDEAF1_0%,#FBF1C9_48%,#F9D5DE_100%)] px-5 py-4 sm:px-7">
              <HopeAvatar size={42} />
              <div className="min-w-0 flex-1">
                <p
                  id="hcg-chatbot-title"
                  className="truncate font-manrope text-[17px] leading-tight font-semibold text-[#1F1F1F]"
                >
                  AI Assistant
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 font-manrope text-[13px] text-[#3D3D3D]">
                  <span className="h-2 w-2 rounded-full bg-[#5CC45C]" />
                  Online
                </p>
              </div>
              <Image
                src={LOGO_SRC}
                alt="HCG Foundation"
                width={97}
                height={33}
                unoptimized
                priority
                className="h-8 w-auto shrink-0"
              />
              {!isEmpty ? (
                <button
                  type="button"
                  onClick={resetChat}
                  aria-label="Start a new conversation"
                  title="New conversation"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#1F1F1F]/70 transition hover:bg-white/60 hover:text-[#1F1F1F]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="-mr-1.5 flex h-9 w-9 items-center justify-center rounded-full text-[#1F1F1F] transition hover:bg-white/60"
              >
                <ChevronDown className="h-6 w-6 sm:hidden" />
                <X className="hidden h-6 w-6 sm:block" strokeWidth={1.75} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              aria-live="polite"
              onClick={onMessageLinkClick}
              className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7"
            >
              {isEmpty ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center pt-2 text-center"
                >
                  <HopeAvatar size={80} />
                  <h2 className="mt-5 font-tiempos-headline text-[26px] leading-tight text-[#1F1F1F] italic">
                    Hey! How can we help you? <span className="not-italic">👋</span>
                  </h2>
                  <p className="mt-3 max-w-[17rem] font-tiempos-text text-[15px] leading-relaxed text-[#7A7A7A]">
                    I can help you with information, programs, donations and more.
                  </p>

                  <div className="mt-6 flex w-full flex-col gap-3">
                    {SUGGESTIONS.map(({ label, icon: Icon, iconClass }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => void sendQuestion(label)}
                        className="group flex w-full items-center gap-3 rounded-full border border-[#E6E0CC] bg-white px-5 py-3.5 text-left transition hover:border-[#FCCC2D] hover:bg-[#FFFCF0] hover:shadow-sm"
                      >
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${iconClass}`} />
                        <span className="flex-1 font-manrope text-[15px] text-[#2B2B2B]">
                          {label}
                        </span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-[#1F1F1F] transition group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser ? <HopeAvatar /> : null}
                      <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div
                          className={`font-manrope text-[15px] leading-relaxed text-[#2B2B2B] ${
                            isUser
                              ? "rounded-2xl rounded-br-sm bg-[#FCE38D] py-3 pr-3 pl-4"
                              : msg.retryQuestion
                                ? "rounded-2xl rounded-tl-sm border border-[#F3C4C4] bg-[#FDEDED] px-4 py-3"
                                : "rounded-2xl rounded-tl-sm bg-[#F1E9CD] px-4 py-3"
                          }`}
                        >
                          {isUser ? (
                            <div className="flex items-end gap-3">
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <CheckCheck className="mb-0.5 h-3.5 w-3.5 shrink-0 text-[#6B5D2A]" aria-hidden />
                            </div>
                          ) : (
                            <FormattedText text={msg.text} />
                          )}

                          {msg.retryQuestion ? (
                            <button
                              type="button"
                              onClick={() => retry(msg)}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FCCC2D] px-3 py-1 text-xs font-semibold text-[#1F1F1F] transition hover:bg-[#FDC61D]"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Try again
                            </button>
                          ) : null}

                          {msg.sources && msg.sources.length > 0 ? (
                            <div className="mt-3 border-t border-[#E2D7AE] pt-2.5">
                              <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-[#7A6A2E] uppercase">
                                Learn more
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.sources.map((source) => {
                                  const chip =
                                    "inline-flex max-w-full items-center gap-1 rounded-full border border-[#E2D7AE] bg-white px-2.5 py-1 text-[12px] font-medium text-[#2B2B2B] transition hover:border-[#FCCC2D] hover:bg-[#FCE38D]";
                                  const content = (
                                    <>
                                      <span className="max-w-[170px] truncate">{source.title}</span>
                                      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                                    </>
                                  );
                                  return isInternalUrl(source.url) ? (
                                    <Link
                                      key={`${source.url}-${source.title}`}
                                      href={source.url}
                                      className={chip}
                                    >
                                      {content}
                                    </Link>
                                  ) : (
                                    <a
                                      key={`${source.url}-${source.title}`}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={chip}
                                    >
                                      {content}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <span className="mt-1.5 px-1 font-manrope text-[11px] text-[#8A8A8A]">
                          {formatTime(msg.at)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {loading ? <TypingIndicator /> : null}
            </div>

            {/* Composer */}
            <div className="shrink-0 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
              <form
                onSubmit={onSubmit}
                className="flex items-end gap-2 rounded-[28px] border border-[#ECE6D2] bg-white py-1.5 pr-1.5 pl-5 shadow-[0_2px_10px_-4px_rgba(60,48,10,0.12)] transition focus-within:border-[#FCCC2D] focus-within:ring-4 focus-within:ring-[#FCCC2D]/20"
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    resizeInput();
                  }}
                  onKeyDown={onInputKeyDown}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder="Type your message..."
                  aria-label="Ask the HCG Foundation AI Assistant"
                  className="max-h-[120px] min-w-0 flex-1 resize-none self-center bg-transparent py-2 font-manrope text-[15px] leading-relaxed text-[#1F1F1F] outline-none placeholder:text-[#9A9A9A]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D] text-[#1F1F1F] transition hover:bg-[#FDC61D] disabled:opacity-60"
                >
                  <Send className="h-5 w-5 -translate-x-px translate-y-px" strokeWidth={2.25} />
                </button>
              </form>
              {input.length >= MAX_MESSAGE_LENGTH * 0.8 ? (
                <p
                  aria-live="polite"
                  className={`mt-1.5 px-4 text-right font-manrope text-[11px] ${
                    input.length >= MAX_MESSAGE_LENGTH ? "text-[#C62828]" : "text-[#8A8A8A]"
                  }`}
                >
                  {input.length >= MAX_MESSAGE_LENGTH
                    ? `Limit reached (${MAX_MESSAGE_LENGTH} characters) — please keep your question short`
                    : `${input.length} / ${MAX_MESSAGE_LENGTH}`}
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Launcher */}
      <div
        className={`fixed right-4 bottom-16 z-[60] items-end gap-3 sm:right-6 lg:bottom-12 ${
          open ? "hidden sm:flex" : "flex"
        } flex-col`}
      >
        <AnimatePresence>
          {showTeaser && !open ? (
            <motion.div
              key="teaser"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="relative hidden max-w-[250px] rounded-2xl rounded-br-sm bg-[#FBF8EC] py-3 pr-8 pl-4 shadow-[0_12px_32px_-8px_rgba(60,48,10,0.35)] ring-1 ring-[#E6E0CC] sm:block"
            >
              <button
                type="button"
                onClick={toggle}
                className="text-left font-manrope text-sm leading-snug text-[#2B2B2B]"
              >
                <span className="font-semibold">Hi! I’m Hope 👋</span> Ask me about donations,
                programs or volunteering.
              </button>
              <button
                type="button"
                onClick={dismissTeaser}
                aria-label="Dismiss"
                className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[#8A8A8A] transition hover:bg-[#F1E9CD] hover:text-[#1F1F1F]"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={open ? "Close chat" : "Open HCG Foundation AI Assistant"}
          aria-expanded={open}
          className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full"
        >
          {!open ? (
            <motion.span
              aria-hidden
              className="absolute inset-2 rounded-full bg-[#FCCC2D]/50"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
              transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity, repeatDelay: 4 }}
            />
          ) : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {open ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FCCC2D] shadow-[0_10px_24px_-8px_rgba(60,48,10,0.5)]">
                  <X className="h-5 w-5 text-[#1F1F1F]" strokeWidth={2} />
                </span>
              ) : (
                <HopeBadge size={72} />
              )}
            </motion.span>
          </AnimatePresence>
          {hasUnread && !open ? (
            <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#E5383B] ring-2 ring-white" />
          ) : null}
        </motion.button>
      </div>
    </>
  );
}
