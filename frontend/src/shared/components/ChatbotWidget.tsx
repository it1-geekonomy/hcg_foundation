"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Send, X } from "lucide-react";
import { chatbotApi } from "@/shared/lib/chatbot-api";

type ChatRole = "bot" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  sources?: { title: string; url: string }[];
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hi, I’m HCG’s AI assistant. Ask me about our programs, donations, volunteering, or how we support patients.",
};

const SUGGESTIONS = [
  "How can I donate?",
  "What programs do you run?",
  "How can I volunteer?",
];

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "user", text: trimmed },
    ]);
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
          sources: res.data?.sources ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "bot",
          text: "I’m having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendQuestion(input);
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <div
          className="flex w-[min(calc(100vw-2rem),22rem)] flex-col overflow-hidden rounded-2xl border border-[#FCCC2D]/40 bg-[#FFF6D8] shadow-[0_18px_50px_rgba(56,46,7,0.28)]"
          role="dialog"
          aria-labelledby="hcg-chatbot-title"
        >
          <div className="flex items-center gap-3 bg-[#1c1c1c] px-4 py-3">
            <Image
              src="/footer/Logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full bg-white object-contain p-0.5"
            />
            <div className="min-w-0 flex-1">
              <p
                id="hcg-chatbot-title"
                className="font-tiempos-fine text-sm font-normal text-white"
              >
                HCG Foundation Assistant
              </p>
              <p className="font-manrope text-[11px] font-light text-white/70">
                Powered by AI · Ask anything
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-[#FCCC2D]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex h-[min(52vh,22rem)] flex-col gap-3 overflow-y-auto px-3 py-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 font-manrope text-[13px] leading-snug ${
                    msg.role === "user"
                      ? "rounded-br-md bg-[#FCCC2D] text-[#3A2E00]"
                      : "rounded-bl-md bg-white text-[#382E07] shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.role === "bot" && msg.sources && msg.sources.length > 0 ? (
                    <div className="mt-3 border-t border-[#FCCC2D]/30 pt-2.5">
                      <p className="mb-1.5 font-manrope text-[10px] font-medium uppercase tracking-wider text-[#9A7B00]/70">
                        Sources
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {msg.sources.map((source) => (
                          <li key={`${source.url}-${source.title}`}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-[#FCCC2D]/20 px-2.5 py-1 text-[11px] font-medium text-[#9A7B00] transition hover:bg-[#FCCC2D]/40"
                            >
                              <span className="max-w-[150px] truncate">{source.title}</span>
                              <svg className="h-2.5 w-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 shadow-sm">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9A7B00] [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9A7B00] [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9A7B00]" />
                  </span>
                  <span className="font-manrope text-[11px] text-[#9A7B00]">
                    AI is thinking…
                  </span>
                </div>
              </div>
            ) : null}

            {messages.length === 1 && !loading ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendQuestion(suggestion)}
                    className="rounded-full border border-[#FCCC2D] bg-white px-3 py-1 font-manrope text-[11px] text-[#3A2E00] transition hover:bg-[#FCCC2D]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 border-t border-[#FCCC2D]/30 bg-white px-3 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI…"
              aria-label="Ask the AI assistant"
              className="min-w-0 flex-1 bg-transparent font-manrope text-sm text-[#382E07] outline-none placeholder:text-[#382E07]/40"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D] text-[#3A2E00] transition hover:brightness-105 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="bg-white px-3 pb-2 text-center font-manrope text-[10px] font-light text-[#382E07]/50">
            Answers generated by AI
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close AI chat" : "Open HCG AI assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FCCC2D] text-[#3A2E00] shadow-[0_10px_28px_rgba(252,204,45,0.45)] transition hover:brightness-105"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>
    </div>
  );
}
