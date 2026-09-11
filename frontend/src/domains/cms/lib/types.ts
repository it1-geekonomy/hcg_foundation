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

export type DonationStatus = "pending" | "paid" | "failed" | "refunded";

export type Donor = {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  country?: string | null;
  isInternational: boolean;
  pan?: string | null;
  message?: string | null;
  amount: string;
  currency: string;
  receiptNumber?: string | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
};

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
