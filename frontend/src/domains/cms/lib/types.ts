export type ContentStatus = "draft" | "published" | "archived";

export type TeamMemberType = "trustee" | "team";

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  schemaCode?: string;
};

export type Team = SeoFields & {
  id: string;
  title: string;
  designation?: string | null;
  teamImage?: string | null;
  content?: string | null;
  shortDescription?: string | null;
  memberType: TeamMemberType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamPayload = SeoFields & {
  title: string;
  designation?: string;
  teamImage?: string;
  content?: string;
  shortDescription?: string;
  memberType: TeamMemberType;
  status?: ContentStatus;
};

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  fullName: string;
  email: string;
  username: string;
  password: string;
};

export type AnnualReport = SeoFields & {
  id: string;
  title: string;
  slug: string;
  reportYear?: string | null;
  annualReportBanner?: string | null;
  annualReportFile?: string | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AnnualReportFields = SeoFields & {
  title: string;
  slug: string;
  reportYear?: string;
  status?: ContentStatus;
};

export type LegalPageType = "privacy_policy" | "terms_and_conditions";

export type LegalPage = SeoFields & {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  pageType: LegalPageType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateLegalPagePayload = SeoFields & {
  title: string;
  slug: string;
  content?: string;
  pageType: LegalPageType;
  status?: ContentStatus;
};

export type UpdateLegalPagePayload = Partial<CreateLegalPagePayload>;

export type PatientStory = SeoFields & {
  id: string;
  title: string;
  slug: string;
  patientImage?: string | null;
  storyDate?: string | null;
  donationState?: string | null;
  content?: string | null;
  shortDescription?: string | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientStoryPayload = SeoFields & {
  title: string;
  slug: string;
  patientImage?: string;
  storyDate?: string;
  donationState?: string;
  content?: string;
  shortDescription?: string;
  status?: ContentStatus;
};

export type UpdatePatientStoryPayload = Partial<CreatePatientStoryPayload>;

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiEnvelope<T> = {
  data: T;
};
