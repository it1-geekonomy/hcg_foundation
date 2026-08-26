"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Heart,
  ImageIcon,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react";

type ChatVisual = {
  id: string;
  kind: "image" | "report" | "story" | "event" | "project" | "blog";
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  badge?: string;
};

type Insight = { label: string; value: string };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  visuals?: ChatVisual[];
  insights?: Insight[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

const DONATE_URL = "https://www.hcgfoundation.org/donate-now";

const SUGGESTIONS = [
  { label: "Help a patient", prompt: "How can I donate to support a cancer patient?" },
  { label: "Patient stories", prompt: "Show me patient stories from HCG Foundation" },
  { label: "What we do", prompt: "What programs does HCG Foundation run?" },
  { label: "Prevent oral cancer", prompt: "How can I prevent oral cancer?" },
];

function welcomeMessages(): ChatMessage[] {
  return [
    {
      id: "welcome",
      role: "assistant",
      text: "Hello. Ask me about HCG Foundation programs, events, patient stories, or policies.",
    },
  ];
}

async function askChatbot(question: string): Promise<{
  answer: string;
  visuals: ChatVisual[];
  insights: Insight[];
}> {
  const res = await fetch(`${API_URL}/chatbot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Chat failed (${res.status})`);
  }

  const data = (await res.json()) as {
    answer?: string;
    visuals?: ChatVisual[];
    insights?: Insight[];
  };

  return {
    answer: data.answer?.trim() || "I could not find an answer right now.",
    visuals: data.visuals || [],
    insights: data.insights || [],
  };
}

function VisualCard({ item }: { item: ChatVisual }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isReport = item.kind === "report";
  const showImage = Boolean(item.imageUrl) && !imgFailed;

  return (
    <a
      href={item.linkUrl || item.imageUrl || "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex h-[11.25rem] w-[10rem] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_6px_18px_-12px_rgba(11,61,74,0.45)] transition hover:-translate-y-0.5 hover:border-[#c45c7a]/40 hover:shadow-md"
    >
      <div className="relative h-[5.6rem] w-full shrink-0 overflow-hidden bg-slate-100">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#0b3d4a] to-[#1a6b7a] text-white/90">
            {isReport ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
          </div>
        )}
        {item.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {item.badge}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between p-2.5">
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-800">
          {item.title}
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0b3d4a]">
          {isReport ? "Open PDF" : "Read more"}
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

function VisualCarousel({ items }: { items: ChatVisual[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(max > 4 && el.scrollLeft < max - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Matching this answer
        </p>
        {(canLeft || canRight) && (
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous"
              disabled={!canLeft}
              onClick={() => scrollerRef.current?.scrollBy({ left: -180, behavior: "smooth" })}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={!canRight}
              onClick={() => scrollerRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c45c7a]/50"
      >
        {items.map((v) => (
          <VisualCard key={v.id} item={v} />
        ))}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(welcomeMessages);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canClear = messages.length > 1 && !loading;

  useEffect(() => {
    const target = loading ? loadingRef.current : lastMessageRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [messages, open, loading]);

  function clearConversation() {
    if (!canClear) return;
    setInput("");
    setMessages(welcomeMessages());
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: q }]);
    setLoading(true);

    try {
      const result = await askChatbot(q);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: result.answer,
          visuals: result.visuals,
          insights: result.insights,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: "Sorry — the assistant is unavailable right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto flex h-[min(38rem,80vh)] w-[min(24.5rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-[1.6rem] border border-[#0b3d4a]/10 bg-white shadow-[0_28px_70px_-28px_rgba(11,61,74,0.55)]"
          >
            <header className="relative overflow-hidden bg-[#0b3d4a] px-4 py-3.5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#c45c7a]/35 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 left-10 h-20 w-20 rounded-full bg-[#d4a017]/25 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-teal-200/90">
                    HCG Foundation
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold">Care assistant</p>
                  <p className="mt-0.5 text-[11px] text-white/70">
                    Answers with dignity. Giving with purpose.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    disabled={!canClear}
                    onClick={clearConversation}
                    className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-35"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Close chat"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-[#f7f5f2] px-3 py-3"
            >
              {messages.map((m, index) => (
                <motion.div
                  key={m.id}
                  ref={index === messages.length - 1 ? lastMessageRef : undefined}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[94%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-[#0b3d4a] text-white whitespace-pre-wrap"
                        : "w-full rounded-bl-md border border-white bg-white text-slate-700 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.visuals && m.visuals.length > 0 && (
                      <VisualCarousel items={m.visuals} />
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div ref={loadingRef} className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-white bg-white px-3 py-2.5 text-sm text-slate-400 shadow-sm">
                    Finding a clear answer…
                  </div>
                </div>
              )}

              {messages.length <= 1 && !loading && (
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.prompt}
                      type="button"
                      onClick={() => void send(s.prompt)}
                      className="rounded-2xl border border-white bg-white px-3 py-2.5 text-left text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-[#c45c7a]/40 hover:text-[#9b2d4a]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

            </div>

            <div className="border-t border-slate-100 bg-white p-2.5">
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noreferrer"
                className="mb-2 flex items-center justify-between rounded-xl bg-[#fff6f8] px-3 py-2 text-[11px] text-[#9b2d4a] ring-1 ring-[#c45c7a]/20 transition hover:bg-[#fdecef]"
              >
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Heart className="h-3.5 w-3.5 fill-[#c45c7a] text-[#c45c7a]" />
                  Support a patient’s treatment
                </span>
                <span className="font-bold">Donate now →</span>
              </a>
              <form onSubmit={onSubmit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask how you can help…"
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-[#f7f5f2] px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#c45c7a]/50 focus:ring-2 focus:ring-[#c45c7a]/15"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b3d4a] text-white transition hover:bg-[#0f5263] disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="pointer-events-auto relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0b3d4a] text-white shadow-[0_14px_34px_-10px_rgba(11,61,74,0.7)]"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
