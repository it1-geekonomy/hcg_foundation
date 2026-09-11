import type {
  ApiEnvelope,
  AnnualReport,
  AnnualReportFields,
  CreateLegalPagePayload,
  CreateUserPayload,
  LegalPage,
  LegalPageType,
  Paginated,
  Team,
  TeamFields,
  AdminUser,
  ContentStatus,
  DonationStatus,
  Donor,
  TeamMemberType,
  UpdateLegalPagePayload,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

export type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus | DonationStatus;
  memberType?: TeamMemberType;
  pageType?: LegalPageType;
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
};

function toQuery(params?: ListQuery) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search?.trim()) q.set("search", params.search.trim());
  if (params?.status) q.set("status", params.status);
  if (params?.memberType) q.set("memberType", params.memberType);
  if (params?.pageType) q.set("pageType", params.pageType);
  if (params?.includeDeleted === true) q.set("includeDeleted", "true");
  if (params?.onlyDeleted === true) q.set("onlyDeleted", "true");
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

function teamFormData(
  fields: TeamFields,
  image?: { file?: File | null; url?: string | null }
) {
  const fd = new FormData();
  fd.append("title", fields.title.trim());
  if (fields.designation?.trim()) {
    fd.append("designation", fields.designation.trim());
  }
  if (fields.content?.trim()) {
    fd.append("content", fields.content);
  }
  if (fields.shortDescription?.trim()) {
    fd.append("shortDescription", fields.shortDescription.trim());
  }
  fd.append("status", fields.status ?? "draft");
  if (fields.metaTitle?.trim()) {
    fd.append("metaTitle", fields.metaTitle.trim());
  }
  if (fields.metaDescription?.trim()) {
    fd.append("metaDescription", fields.metaDescription.trim());
  }
  if (fields.schemaCode?.trim()) {
    fd.append("schemaCode", fields.schemaCode.trim());
  }
  if (image?.file instanceof File) {
    fd.append("teamImage", image.file, image.file.name);
  }
  return fd;
}

/** PATCH — only append keys that were provided (partial update). */
function teamPatchFormData(
  fields: Partial<TeamFields>,
  teamImageFile?: File | null
) {
  const fd = new FormData();
  const append = (key: keyof TeamFields, value?: string | null) => {
    if (value === undefined) return;
    fd.append(key, value ?? "");
  };
  append("title", fields.title);
  append("designation", fields.designation);
  append("content", fields.content);
  append("shortDescription", fields.shortDescription);
  append("status", fields.status);
  append("metaTitle", fields.metaTitle);
  append("metaDescription", fields.metaDescription);
  append("schemaCode", fields.schemaCode);
  if (teamImageFile instanceof File) {
    fd.append("teamImage", teamImageFile, teamImageFile.name);
  }
  return fd;
}

export const cmsApi = {
  listTeams: (params?: ListQuery) =>
    request<Paginated<Team>>(`/teams${toQuery({ page: 1, limit: 20, ...params })}`),

  listDeletedTeams: (params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">) =>
    request<Paginated<Team>>(
      `/teams/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getTeam: (id: string) => request<ApiEnvelope<Team>>(`/teams/${id}`),

  createTeam: (
    fields: TeamFields,
    image?: { file?: File | null; url?: string | null }
  ) =>
    requestFormData<ApiEnvelope<Team>>(
      "/teams",
      "POST",
      teamFormData(fields, image)
    ),

  updateTeam: (
    id: string,
    fields: Partial<TeamFields>,
    teamImageFile?: File | null
  ) =>
    requestFormData<ApiEnvelope<Team>>(
      `/teams/${id}`,
      "PATCH",
      teamPatchFormData(fields, teamImageFile)
    ),

  deleteTeam: (id: string) =>
    request<{ message?: string; statusCode?: number }>(`/teams/${id}`, {
      method: "DELETE",
    }),

  restoreTeam: (id: string) =>
    request<ApiEnvelope<Team>>(`/teams/${id}/restore`, {
      method: "POST",
    }),

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

  listDonors: (params?: ListQuery) =>
    request<Paginated<Donor>>(
      `/donors${toQuery({ page: 1, limit: 10, ...params })}`
    ),

  getDonor: (id: string) => request<ApiEnvelope<Donor>>(`/donors/${id}`),
};

/** Public site: published people */
export const publicTeamsApi = {
  listPublished: (params?: Omit<ListQuery, "status">) =>
    request<Paginated<Team>>(
      `/teams/published${toQuery({ page: 1, limit: 50, ...params })}`
    ),

  getById: (id: string) => request<ApiEnvelope<Team>>(`/teams/${id}`),
};
