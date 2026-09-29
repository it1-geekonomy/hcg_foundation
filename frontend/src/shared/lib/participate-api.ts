const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

export type FundraisingCampaignPayload = {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  fundraisingGoal: string;
  fundraisingReason: string;
  message?: string;
  termsAccepted: boolean;
};

export type VolunteerPayload = {
  fullName: string;
  phone: string;
  email: string;
  cityLocation: string;
  educationalQualification: string;
  areasOfInterest: string;
  reason: string;
  termsAccepted: boolean;
};

export type InternshipPayload = {
  fullName: string;
  phone: string;
  email: string;
  gender?: string;
  /** YYYY-MM-DD */
  dob?: string;
  currentCourse?: string;
  address?: string;
  languages?: string;
  computerSkills?: string;
  message?: string;
  termsAccepted: boolean;
  cv: File;
};

type Envelope<T = unknown> = {
  statusCode: number;
  message: string;
  data: T;
};

async function send<T>(path: string, init: RequestInit): Promise<Envelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, cache: "no-store" });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(", ");
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  return res.json() as Promise<Envelope<T>>;
}

function postJson<T>(path: string, payload: unknown) {
  return send<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export const participateApi = {
  submitFundraisingCampaign: (payload: FundraisingCampaignPayload) =>
    postJson("/fundraising-campaigns", payload),

  submitVolunteer: (payload: VolunteerPayload) =>
    postJson("/volunteer", payload),

  submitInternship: ({ cv, ...fields }: InternshipPayload) => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === "") continue;
      fd.append(key, String(value));
    }
    fd.append("cv", cv, cv.name);
    return send("/leads-internship", { method: "POST", body: fd });
  },
};
