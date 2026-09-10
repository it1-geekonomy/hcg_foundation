import type {
  ApiEnvelope,
  AnnualReport,
  AnnualReportFields,
  CreateLegalPagePayload,
  CreateTeamPayload,
  CreateUserPayload,
  LegalPage,
  LegalPageType,
  Paginated,
  Team,
  AdminUser,
  ContentStatus,
  TeamMemberType,
  UpdateLegalPagePayload,
  UpdateTeamPayload,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

export type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  memberType?: TeamMemberType;
  pageType?: LegalPageType;
};

function toQuery(params?: ListQuery) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search?.trim()) q.set("search", params.search.trim());
  if (params?.status) q.set("status", params.status);
  if (params?.memberType) q.set("memberType", params.memberType);
  if (params?.pageType) q.set("pageType", params.pageType);
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function parseError(res: Response): Promise<string> {
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body?.message === "string") message = body.message;
    else if (Array.isArray(body?.message)) message = body.message.join(", ");
  } catch {
    // ignore parse errors
  }
  return message;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hcg-admin-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string | null };
    };
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Multipart — do not set Content-Type (browser sets boundary). */
async function requestFormData<T>(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    body: formData,
    headers: {
      ...authHeaders(),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function annualReportFormData(
  fields: AnnualReportFields,
  files?: { banner?: File | null; file?: File | null }
) {
  const fd = new FormData();
  fd.append("title", fields.title);
  fd.append("slug", fields.slug);
  if (fields.reportYear?.trim()) fd.append("reportYear", fields.reportYear.trim());
  if (fields.status) fd.append("status", fields.status);
  if (fields.metaTitle?.trim()) fd.append("metaTitle", fields.metaTitle.trim());
  if (fields.metaDescription?.trim())
    fd.append("metaDescription", fields.metaDescription.trim());
  if (fields.schemaCode?.trim()) fd.append("schemaCode", fields.schemaCode.trim());
  if (files?.banner) fd.append("banner", files.banner);
  if (files?.file) fd.append("file", files.file);
  return fd;
}

export const cmsApi = {
  listTeams: (params?: ListQuery) =>
    request<Paginated<Team>>(`/teams${toQuery({ page: 1, limit: 10, ...params })}`),

  getTeam: (id: string) => request<ApiEnvelope<Team>>(`/teams/${id}`),

  createTeam: (payload: CreateTeamPayload) =>
    request<ApiEnvelope<Team>>("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTeam: (id: string, payload: UpdateTeamPayload) =>
    request<ApiEnvelope<Team>>(`/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTeam: (id: string) =>
    request<void>(`/teams/${id}`, { method: "DELETE" }),

  listUsers: (params?: ListQuery) =>
    request<Paginated<AdminUser>>(
      `/users${toQuery({ page: 1, limit: 10, ...params })}`
    ),

  createUser: (payload: CreateUserPayload) =>
    request<ApiEnvelope<AdminUser>>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteUser: (id: string) =>
    request<void>(`/users/${id}`, { method: "DELETE" }),

  listAnnualReports: (params?: ListQuery) =>
    request<Paginated<AnnualReport>>(
      `/annual-reports${toQuery({ page: 1, limit: 10, ...params })}`
    ),

  getAnnualReport: (id: string) =>
    request<ApiEnvelope<AnnualReport>>(`/annual-reports/${id}`),

  createAnnualReport: (
    fields: AnnualReportFields,
    files?: { banner?: File | null; file?: File | null }
  ) =>
    requestFormData<ApiEnvelope<AnnualReport>>(
      "/annual-reports",
      "POST",
      annualReportFormData(fields, files)
    ),

  updateAnnualReport: (
    id: string,
    fields: AnnualReportFields,
    files?: { banner?: File | null; file?: File | null }
  ) =>
    requestFormData<ApiEnvelope<AnnualReport>>(
      `/annual-reports/${id}`,
      "PATCH",
      annualReportFormData(fields, files)
    ),

  deleteAnnualReport: (id: string) =>
    request<void>(`/annual-reports/${id}`, { method: "DELETE" }),

  listLegalPages: (params?: ListQuery) =>
    request<Paginated<LegalPage>>(
      `/legal-pages${toQuery({ page: 1, limit: 10, ...params })}`
    ),

  getLegalPage: (id: string) =>
    request<ApiEnvelope<LegalPage>>(`/legal-pages/${id}`),

  getPublishedLegalPage: (pageType: LegalPageType) =>
    request<ApiEnvelope<LegalPage>>(`/legal-pages/published/${pageType}`),

  createLegalPage: (payload: CreateLegalPagePayload) =>
    request<ApiEnvelope<LegalPage>>("/legal-pages", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateLegalPage: (id: string, payload: UpdateLegalPagePayload) =>
    request<ApiEnvelope<LegalPage>>(`/legal-pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteLegalPage: (id: string) =>
    request<void>(`/legal-pages/${id}`, { method: "DELETE" }),
};

/** Public site: published people, optionally by trustee/team */
export const publicTeamsApi = {
  listPublished: (params?: Omit<ListQuery, "status">) =>
    request<Paginated<Team>>(
      `/teams${toQuery({ page: 1, limit: 50, ...params, status: "published" })}`
    ),

  getById: (id: string) => request<ApiEnvelope<Team>>(`/teams/${id}`),
};
