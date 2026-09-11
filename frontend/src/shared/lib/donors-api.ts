const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

export type DonationCheckout = {
  orderId: string;
  amount: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  name: string;
  email: string;
  phone: string;
  isInternational: boolean;
};

export type DonorRecord = {
  id: string;
  fullName: string;
  amount: string;
  currency: string;
  status: string;
  receiptNumber?: string | null;
};

export type CreateDonationPayload = {
  fullName: string;
  phone: string;
  email: string;
  city?: string;
  country?: string;
  isInternational?: boolean;
  pan?: string;
  message?: string;
  amount: number;
};

export type VerifyDonationPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

type Envelope<T> = {
  statusCode: number;
  message: string;
  data: T;
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

export const donorsApi = {
  createOrder: (payload: CreateDonationPayload) =>
    request<Envelope<DonationCheckout>>("/donors/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verify: (payload: VerifyDonationPayload) =>
    request<Envelope<DonorRecord>>("/donors/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
