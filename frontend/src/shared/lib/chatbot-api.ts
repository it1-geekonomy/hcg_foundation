const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

type Envelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type ChatbotSource = {
  title: string;
  url: string;
};

export type ChatbotReply = {
  answer: string;
  sources?: ChatbotSource[];
  session_id?: string;
  response_time_ms?: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(", ");
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const chatbotApi = {
  ask: (question: string, sessionId?: string) =>
    request<Envelope<ChatbotReply>>("/chatbot/chat", {
      method: "POST",
      body: JSON.stringify({
        question,
        sessionId,
      }),
    }),
};
