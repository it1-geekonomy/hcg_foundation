import type {
  ApiEnvelope,
  AnnualReport,
  AnnualReportFields,
  Award,
  AwardFields,
  CampaignStatus,
  CmsEvent,
  CmsProject,
  CreateLegalPagePayload,
  CreateUserPayload,
  EventFields,
  FundraisingCampaign,
  HomeBanner,
  HomeBannerFields,
  InquiryStatus,
  LeadsContact,
  LeadsInternship,
  LegalPage,
  LegalPageType,
  Paginated,
  PartnershipInquiry,
  ProjectFields,
  Team,
  TeamFields,
  AdminUser,
  ContentStatus,
  DonationStatus,
  Donor,
  TeamMemberType,
  UpdateFundraisingCampaignPayload,
  UpdateHomeBannerPayload,
  UpdateLeadsContactPayload,
  UpdateLeadsInternshipPayload,
  UpdateLegalPagePayload,
  UpdatePartnershipInquiryPayload,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:6060/api";

export type LegalApiPath = "/privacy-policy" | "/terms-and-conditions";

export type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus | DonationStatus | CampaignStatus | InquiryStatus;
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

/** Dedupe concurrent identical GETs (React Strict Mode double-mount in dev). */
const inFlightGets = new Map<string, Promise<unknown>>();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();

  if (method === "GET") {
    const pending = inFlightGets.get(path);
    if (pending) return pending as Promise<T>;
  }

  const promise = (async (): Promise<T> => {
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
  })();

  if (method === "GET") {
    inFlightGets.set(path, promise);
    promise.finally(() => {
      inFlightGets.delete(path);
    });
  }

  return promise;
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
  files?: {
    banner?: File | null;
    mobileBanner?: File | null;
    file?: File | null;
  }
) {
  const fd = new FormData();
  fd.append("title", fields.title.trim());
  fd.append("slug", fields.slug.trim());
  if (fields.reportYear?.trim()) {
    fd.append("reportYear", fields.reportYear.trim());
  }
  if (fields.status) fd.append("status", fields.status);
  if (fields.metaTitle?.trim()) {
    fd.append("metaTitle", fields.metaTitle.trim());
  }
  if (fields.metaDescription?.trim()) {
    fd.append("metaDescription", fields.metaDescription.trim());
  }
  if (fields.schemaCode?.trim()) {
    fd.append("schemaCode", fields.schemaCode.trim());
  }
  if (files?.banner instanceof File) {
    fd.append("annualReportBanner", files.banner, files.banner.name);
  }
  if (files?.mobileBanner instanceof File) {
    fd.append(
      "annualReportMobileBanner",
      files.mobileBanner,
      files.mobileBanner.name
    );
  }
  if (files?.file instanceof File) {
    fd.append("annualReportFile", files.file, files.file.name);
  }
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

function awardFormData(fields: AwardFields, awardImageFile?: File | null) {
  const fd = new FormData();
  fd.append("title", fields.title.trim());
  if (fields.year?.trim()) fd.append("year", fields.year.trim());
  if (fields.description?.trim()) {
    fd.append("description", fields.description.trim());
  }
  if (fields.displayOrder?.trim()) {
    fd.append("displayOrder", fields.displayOrder.trim());
  }
  if (fields.status) fd.append("status", fields.status);
  if (awardImageFile instanceof File) {
    fd.append("awardImage", awardImageFile, awardImageFile.name);
  }
  return fd;
}

function awardPatchFormData(
  fields: Partial<AwardFields>,
  awardImageFile?: File | null
) {
  const fd = new FormData();
  const append = (key: string, value?: string | null) => {
    if (value === undefined) return;
    fd.append(key, value ?? "");
  };
  append("title", fields.title);
  append("year", fields.year);
  append("description", fields.description);
  append("displayOrder", fields.displayOrder);
  append("status", fields.status);
  if (awardImageFile instanceof File) {
    fd.append("awardImage", awardImageFile, awardImageFile.name);
  }
  return fd;
}

function homeBannerFormData(
  fields: HomeBannerFields,
  files?: {
    bannerImage?: File | null;
    mobileBannerImage?: File | null;
    profileImage?: File | null;
  }
) {
  const fd = new FormData();
  fd.append("name", fields.name.trim());
  fd.append("title", fields.title.trim());
  if (fields.location?.trim()) fd.append("location", fields.location.trim());
  if (fields.shortDescription?.trim()) {
    fd.append("shortDescription", fields.shortDescription.trim());
  }
  fd.append("displayOrder", String(fields.displayOrder));
  fd.append("isActive", fields.isActive ? "true" : "false");
  if (files?.bannerImage instanceof File) {
    fd.append("bannerImage", files.bannerImage, files.bannerImage.name);
  }
  if (files?.mobileBannerImage instanceof File) {
    fd.append(
      "mobileBannerImage",
      files.mobileBannerImage,
      files.mobileBannerImage.name
    );
  }
  if (files?.profileImage instanceof File) {
    fd.append("profileImage", files.profileImage, files.profileImage.name);
  }
  return fd;
}

function homeBannerPatchFormData(
  fields: Partial<HomeBannerFields>,
  files?: {
    bannerImage?: File | null;
    mobileBannerImage?: File | null;
    profileImage?: File | null;
  }
) {
  const fd = new FormData();
  const append = (key: keyof HomeBannerFields, value?: string | number | boolean | null) => {
    if (value === undefined) return;
    if (key === "displayOrder") {
      fd.append(key, String(value));
      return;
    }
    if (key === "isActive") {
      fd.append(key, value ? "true" : "false");
      return;
    }
    fd.append(key, value == null ? "" : String(value));
  };
  append("name", fields.name);
  append("title", fields.title);
  append("location", fields.location);
  append("shortDescription", fields.shortDescription);
  append("displayOrder", fields.displayOrder);
  append("isActive", fields.isActive);
  if (files?.bannerImage instanceof File) {
    fd.append("bannerImage", files.bannerImage, files.bannerImage.name);
  }
  if (files?.mobileBannerImage instanceof File) {
    fd.append(
      "mobileBannerImage",
      files.mobileBannerImage,
      files.mobileBannerImage.name
    );
  }
  if (files?.profileImage instanceof File) {
    fd.append("profileImage", files.profileImage, files.profileImage.name);
  }
  return fd;
}

function eventFormData(
  fields: EventFields,
  files?: {
    eventBanner?: File | null;
    eventMobileBanner?: File | null;
  }
) {
  const fd = new FormData();
  fd.append("title", fields.title.trim());
  fd.append("slug", fields.slug.trim());
  if (fields.eventDate?.trim()) fd.append("eventDate", fields.eventDate.trim());
  if (fields.eventLocation?.trim()) {
    fd.append("eventLocation", fields.eventLocation.trim());
  }
  if (fields.eventTime?.trim()) fd.append("eventTime", fields.eventTime.trim());
  if (fields.content?.trim()) fd.append("content", fields.content);
  if (fields.shortDescription?.trim()) {
    fd.append("shortDescription", fields.shortDescription.trim());
  }
  if (fields.status) fd.append("status", fields.status);
  if (fields.metaTitle?.trim()) fd.append("metaTitle", fields.metaTitle.trim());
  if (fields.metaDescription?.trim()) {
    fd.append("metaDescription", fields.metaDescription.trim());
  }
  if (fields.schemaCode?.trim()) {
    fd.append("schemaCode", fields.schemaCode.trim());
  }
  if (files?.eventBanner instanceof File) {
    fd.append("eventBanner", files.eventBanner, files.eventBanner.name);
  }
  if (files?.eventMobileBanner instanceof File) {
    fd.append(
      "eventMobileBanner",
      files.eventMobileBanner,
      files.eventMobileBanner.name
    );
  }
  return fd;
}

function eventPatchFormData(
  fields: Partial<EventFields>,
  files?: {
    eventBanner?: File | null;
    eventMobileBanner?: File | null;
  }
) {
  const fd = new FormData();
  const append = (key: string, value?: string | null) => {
    if (value === undefined) return;
    fd.append(key, value ?? "");
  };
  append("title", fields.title);
  append("slug", fields.slug);
  append("eventDate", fields.eventDate);
  append("eventLocation", fields.eventLocation);
  append("eventTime", fields.eventTime);
  append("content", fields.content);
  append("shortDescription", fields.shortDescription);
  append("status", fields.status);
  append("metaTitle", fields.metaTitle);
  append("metaDescription", fields.metaDescription);
  append("schemaCode", fields.schemaCode);
  if (files?.eventBanner instanceof File) {
    fd.append("eventBanner", files.eventBanner, files.eventBanner.name);
  }
  if (files?.eventMobileBanner instanceof File) {
    fd.append(
      "eventMobileBanner",
      files.eventMobileBanner,
      files.eventMobileBanner.name
    );
  }
  return fd;
}

function projectFormData(
  fields: ProjectFields,
  files?: {
    projectBanner?: File | null;
    projectMobileBanner?: File | null;
  }
) {
  const fd = new FormData();
  fd.append("title", fields.title.trim());
  fd.append("slug", fields.slug.trim());
  if (fields.projectDate?.trim()) {
    fd.append("projectDate", fields.projectDate.trim());
  }
  if (fields.content?.trim()) fd.append("content", fields.content);
  if (fields.shortDescription?.trim()) {
    fd.append("shortDescription", fields.shortDescription.trim());
  }
  if (fields.displayOrder != null) {
    fd.append("displayOrder", String(fields.displayOrder));
  }
  if (fields.status) fd.append("status", fields.status);
  if (fields.metaTitle?.trim()) fd.append("metaTitle", fields.metaTitle.trim());
  if (fields.metaDescription?.trim()) {
    fd.append("metaDescription", fields.metaDescription.trim());
  }
  if (fields.schemaCode?.trim()) {
    fd.append("schemaCode", fields.schemaCode.trim());
  }
  if (files?.projectBanner instanceof File) {
    fd.append("projectBanner", files.projectBanner, files.projectBanner.name);
  }
  if (files?.projectMobileBanner instanceof File) {
    fd.append(
      "projectMobileBanner",
      files.projectMobileBanner,
      files.projectMobileBanner.name
    );
  }
  return fd;
}

function projectPatchFormData(
  fields: Partial<ProjectFields>,
  files?: {
    projectBanner?: File | null;
    projectMobileBanner?: File | null;
  }
) {
  const fd = new FormData();
  const append = (key: string, value?: string | null) => {
    if (value === undefined) return;
    fd.append(key, value ?? "");
  };
  append("title", fields.title);
  append("slug", fields.slug);
  append("projectDate", fields.projectDate);
  append("content", fields.content);
  append("shortDescription", fields.shortDescription);
  append("status", fields.status);
  append("metaTitle", fields.metaTitle);
  append("metaDescription", fields.metaDescription);
  append("schemaCode", fields.schemaCode);
  if (fields.displayOrder !== undefined) {
    fd.append("displayOrder", String(fields.displayOrder));
  }
  if (files?.projectBanner instanceof File) {
    fd.append("projectBanner", files.projectBanner, files.projectBanner.name);
  }
  if (files?.projectMobileBanner instanceof File) {
    fd.append(
      "projectMobileBanner",
      files.projectMobileBanner,
      files.projectMobileBanner.name
    );
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

  listAwards: (params?: ListQuery) =>
    request<Paginated<Award>>(
      `/awards${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedAwards: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<Award>>(
      `/awards/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getAward: async (id: string) => {
    try {
      return await request<ApiEnvelope<Award>>(`/awards/${id}`);
    } catch (err) {
      const deleted = await request<Paginated<Award>>(
        `/awards/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  createAward: (fields: AwardFields, awardImageFile?: File | null) =>
    requestFormData<ApiEnvelope<Award>>(
      "/awards",
      "POST",
      awardFormData(fields, awardImageFile)
    ),

  updateAward: (
    id: string,
    fields: Partial<AwardFields>,
    awardImageFile?: File | null
  ) =>
    requestFormData<ApiEnvelope<Award>>(
      `/awards/${id}`,
      "PATCH",
      awardPatchFormData(fields, awardImageFile)
    ),

  deleteAward: (id: string) =>
    request<{ message?: string; statusCode?: number }>(`/awards/${id}`, {
      method: "DELETE",
    }),

  restoreAward: (id: string) =>
    request<ApiEnvelope<Award>>(`/awards/${id}/restore`, {
      method: "POST",
    }),

  listHomeBanners: (params?: ListQuery) =>
    request<Paginated<HomeBanner>>(
      `/home-banners${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedHomeBanners: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<HomeBanner>>(
      `/home-banners/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getHomeBanner: async (id: string) => {
    try {
      return await request<ApiEnvelope<HomeBanner>>(`/home-banners/${id}`);
    } catch (err) {
      const deleted = await request<Paginated<HomeBanner>>(
        `/home-banners/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  createHomeBanner: (
    fields: HomeBannerFields,
    files: {
      bannerImage: File;
      mobileBannerImage?: File | null;
      profileImage?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<HomeBanner>>(
      "/home-banners",
      "POST",
      homeBannerFormData(fields, files)
    ),

  updateHomeBanner: (
    id: string,
    fields: UpdateHomeBannerPayload,
    files?: {
      bannerImage?: File | null;
      mobileBannerImage?: File | null;
      profileImage?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<HomeBanner>>(
      `/home-banners/${id}`,
      "PATCH",
      homeBannerPatchFormData(fields, files)
    ),

  deleteHomeBanner: (id: string) =>
    request<{ message?: string; statusCode?: number }>(`/home-banners/${id}`, {
      method: "DELETE",
    }),

  restoreHomeBanner: (id: string) =>
    request<ApiEnvelope<HomeBanner>>(`/home-banners/${id}/restore`, {
      method: "POST",
    }),

  listEvents: (params?: ListQuery) =>
    request<Paginated<CmsEvent>>(
      `/events${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedEvents: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<CmsEvent>>(
      `/events/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getEvent: async (id: string) => {
    try {
      return await request<ApiEnvelope<CmsEvent>>(`/events/${id}`);
    } catch (err) {
      const deleted = await request<Paginated<CmsEvent>>(
        `/events/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  createEvent: (
    fields: EventFields,
    files?: {
      eventBanner?: File | null;
      eventMobileBanner?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<CmsEvent>>(
      "/events",
      "POST",
      eventFormData(fields, files)
    ),

  updateEvent: (
    id: string,
    fields: Partial<EventFields>,
    files?: {
      eventBanner?: File | null;
      eventMobileBanner?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<CmsEvent>>(
      `/events/${id}`,
      "PATCH",
      eventPatchFormData(fields, files)
    ),

  deleteEvent: (id: string) =>
    request<{ message?: string; statusCode?: number }>(`/events/${id}`, {
      method: "DELETE",
    }),

  restoreEvent: (id: string) =>
    request<ApiEnvelope<CmsEvent>>(`/events/${id}/restore`, {
      method: "POST",
    }),

  listProjects: (params?: ListQuery) =>
    request<Paginated<CmsProject>>(
      `/projects${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedProjects: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<CmsProject>>(
      `/projects/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getProject: async (id: string) => {
    try {
      return await request<ApiEnvelope<CmsProject>>(`/projects/${id}`);
    } catch (err) {
      const deleted = await request<Paginated<CmsProject>>(
        `/projects/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  createProject: (
    fields: ProjectFields,
    files?: {
      projectBanner?: File | null;
      projectMobileBanner?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<CmsProject>>(
      "/projects",
      "POST",
      projectFormData(fields, files)
    ),

  updateProject: (
    id: string,
    fields: Partial<ProjectFields>,
    files?: {
      projectBanner?: File | null;
      projectMobileBanner?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<CmsProject>>(
      `/projects/${id}`,
      "PATCH",
      projectPatchFormData(fields, files)
    ),

  deleteProject: (id: string) =>
    request<{ message?: string; statusCode?: number }>(`/projects/${id}`, {
      method: "DELETE",
    }),

  restoreProject: (id: string) =>
    request<ApiEnvelope<CmsProject>>(`/projects/${id}/restore`, {
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
      `/annual-reports${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedAnnualReports: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<AnnualReport>>(
      `/annual-reports/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getAnnualReport: (id: string) =>
    request<ApiEnvelope<AnnualReport>>(`/annual-reports/${id}`),

  createAnnualReport: (
    fields: AnnualReportFields,
    files?: {
      banner?: File | null;
      mobileBanner?: File | null;
      file?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<AnnualReport>>(
      "/annual-reports",
      "POST",
      annualReportFormData(fields, files)
    ),

  updateAnnualReport: (
    id: string,
    fields: AnnualReportFields,
    files?: {
      banner?: File | null;
      mobileBanner?: File | null;
      file?: File | null;
    }
  ) =>
    requestFormData<ApiEnvelope<AnnualReport>>(
      `/annual-reports/${id}`,
      "PATCH",
      annualReportFormData(fields, files)
    ),

  deleteAnnualReport: (id: string) =>
    request<{ message?: string; statusCode?: number }>(
      `/annual-reports/${id}`,
      { method: "DELETE" }
    ),

  restoreAnnualReport: (id: string) =>
    request<ApiEnvelope<AnnualReport>>(`/annual-reports/${id}/restore`, {
      method: "POST",
    }),

  listLegalPages: (
    apiPath: LegalApiPath,
    params?: Omit<ListQuery, "pageType" | "onlyDeleted" | "includeDeleted">
  ) =>
    request<Paginated<LegalPage>>(
      `${apiPath}${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedLegalPages: (
    apiPath: LegalApiPath,
    params?: Omit<
      ListQuery,
      "pageType" | "onlyDeleted" | "includeDeleted" | "status"
    >
  ) =>
    request<Paginated<LegalPage>>(
      `${apiPath}/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getLegalPage: async (apiPath: LegalApiPath, id: string) => {
    try {
      return await request<ApiEnvelope<LegalPage>>(`${apiPath}/${id}`);
    } catch (err) {
      // Soft-deleted rows are hidden from GET :id — resolve via trash list (frontend-only)
      const deleted = await request<Paginated<LegalPage>>(
        `${apiPath}/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  getPublishedLegalPages: (
    apiPath: LegalApiPath,
    params?: Omit<ListQuery, "pageType" | "status">
  ) =>
    request<Paginated<LegalPage>>(
      `${apiPath}/published${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  createLegalPage: (apiPath: LegalApiPath, payload: CreateLegalPagePayload) =>
    request<ApiEnvelope<LegalPage>>(apiPath, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateLegalPage: (
    apiPath: LegalApiPath,
    id: string,
    payload: UpdateLegalPagePayload
  ) =>
    request<ApiEnvelope<LegalPage>>(`${apiPath}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteLegalPage: (apiPath: LegalApiPath, id: string) =>
    request<{ message?: string; statusCode?: number }>(`${apiPath}/${id}`, {
      method: "DELETE",
    }),

  restoreLegalPage: (apiPath: LegalApiPath, id: string) =>
    request<ApiEnvelope<LegalPage>>(`${apiPath}/${id}/restore`, {
      method: "POST",
    }),

  listDonors: (params?: ListQuery) =>
    request<Paginated<Donor>>(
      `/donors${toQuery({ page: 1, limit: 10, ...params })}`
    ),

  getDonor: (id: string) => request<ApiEnvelope<Donor>>(`/donors/${id}`),

  listFundraisingCampaigns: (params?: ListQuery) =>
    request<Paginated<FundraisingCampaign>>(
      `/fundraising-campaigns${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedFundraisingCampaigns: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<FundraisingCampaign>>(
      `/fundraising-campaigns/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getFundraisingCampaign: async (id: string) => {
    try {
      return await request<ApiEnvelope<FundraisingCampaign>>(
        `/fundraising-campaigns/${id}`
      );
    } catch (err) {
      const deleted = await request<Paginated<FundraisingCampaign>>(
        `/fundraising-campaigns/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  updateFundraisingCampaign: (
    id: string,
    payload: UpdateFundraisingCampaignPayload
  ) =>
    request<ApiEnvelope<FundraisingCampaign>>(
      `/fundraising-campaigns/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  deleteFundraisingCampaign: (id: string) =>
    request<{ message?: string; statusCode?: number }>(
      `/fundraising-campaigns/${id}`,
      { method: "DELETE" }
    ),

  restoreFundraisingCampaign: (id: string) =>
    request<ApiEnvelope<FundraisingCampaign>>(
      `/fundraising-campaigns/${id}/restore`,
      { method: "POST" }
    ),

  listPartnershipInquiries: (params?: ListQuery) =>
    request<Paginated<PartnershipInquiry>>(
      `/partnership-inquiries${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedPartnershipInquiries: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<PartnershipInquiry>>(
      `/partnership-inquiries/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getPartnershipInquiry: async (id: string) => {
    try {
      return await request<ApiEnvelope<PartnershipInquiry>>(
        `/partnership-inquiries/${id}`
      );
    } catch (err) {
      const deleted = await request<Paginated<PartnershipInquiry>>(
        `/partnership-inquiries/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  updatePartnershipInquiry: (
    id: string,
    payload: UpdatePartnershipInquiryPayload
  ) =>
    request<ApiEnvelope<PartnershipInquiry>>(`/partnership-inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deletePartnershipInquiry: (id: string) =>
    request<{ message?: string; statusCode?: number }>(
      `/partnership-inquiries/${id}`,
      { method: "DELETE" }
    ),

  restorePartnershipInquiry: (id: string) =>
    request<ApiEnvelope<PartnershipInquiry>>(
      `/partnership-inquiries/${id}/restore`,
      { method: "POST" }
    ),

  listLeadsInternship: (params?: ListQuery) =>
    request<Paginated<LeadsInternship>>(
      `/leads-internship${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedLeadsInternship: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<LeadsInternship>>(
      `/leads-internship/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getLeadsInternship: async (id: string) => {
    try {
      return await request<ApiEnvelope<LeadsInternship>>(
        `/leads-internship/${id}`
      );
    } catch (err) {
      const deleted = await request<Paginated<LeadsInternship>>(
        `/leads-internship/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  updateLeadsInternship: (id: string, payload: UpdateLeadsInternshipPayload) =>
    request<ApiEnvelope<LeadsInternship>>(`/leads-internship/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteLeadsInternship: (id: string) =>
    request<{ message?: string; statusCode?: number }>(
      `/leads-internship/${id}`,
      { method: "DELETE" }
    ),

  restoreLeadsInternship: (id: string) =>
    request<ApiEnvelope<LeadsInternship>>(`/leads-internship/${id}/restore`, {
      method: "POST",
    }),

  listLeadsContact: (params?: ListQuery) =>
    request<Paginated<LeadsContact>>(
      `/leads-contact${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  listDeletedLeadsContact: (
    params?: Omit<ListQuery, "onlyDeleted" | "includeDeleted" | "status">
  ) =>
    request<Paginated<LeadsContact>>(
      `/leads-contact/deleted${toQuery({ page: 1, limit: 20, ...params })}`
    ),

  getLeadsContact: async (id: string) => {
    try {
      return await request<ApiEnvelope<LeadsContact>>(`/leads-contact/${id}`);
    } catch (err) {
      const deleted = await request<Paginated<LeadsContact>>(
        `/leads-contact/deleted${toQuery({ page: 1, limit: 100 })}`
      );
      const found = deleted.data?.find((item) => item.id === id);
      if (!found) throw err;
      return {
        statusCode: 200,
        message: "Fetched from recently deleted",
        data: found,
      };
    }
  },

  updateLeadsContact: (id: string, payload: UpdateLeadsContactPayload) =>
    request<ApiEnvelope<LeadsContact>>(`/leads-contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteLeadsContact: (id: string) =>
    request<{ message?: string; statusCode?: number }>(
      `/leads-contact/${id}`,
      { method: "DELETE" }
    ),

  restoreLeadsContact: (id: string) =>
    request<ApiEnvelope<LeadsContact>>(`/leads-contact/${id}/restore`, {
      method: "POST",
    }),
};

/** Public site: published people */
export const publicTeamsApi = {
  listPublished: (params?: Omit<ListQuery, "status">) =>
    request<Paginated<Team>>(
      `/teams/published${toQuery({ page: 1, limit: 50, ...params })}`
    ),

  getById: (id: string) => request<ApiEnvelope<Team>>(`/teams/${id}`),
};

/** Public site: published projects */
export const publicProjectsApi = {
  listPublished: (params?: Omit<ListQuery, "status">) =>
    request<Paginated<CmsProject>>(
      `/projects/published${toQuery({ page: 1, limit: 12, ...params })}`
    ),

  getBySlug: (slug: string) =>
    request<ApiEnvelope<CmsProject>>(
      `/projects/published/slug/${encodeURIComponent(slug)}`
    ),
};

/** Public site: active home banners */
export const publicHomeBannersApi = {
  listActive: () =>
    request<ApiEnvelope<HomeBanner[]>>("/home-banners/active"),
};
