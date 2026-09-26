export type ContentStatus = "draft" | "published" | "archived";

/** Backend field `type` — team member vs trustee */
export type TeamType = "team" | "trustee";

/** @deprecated use TeamType */
export type TeamMemberType = TeamType;

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
  /** team | trustee — API field name is `type` */
  type: TeamType;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Text fields for POST/PATCH /teams (multipart). Image is a file, not a URL. */
export type TeamFields = SeoFields & {
  title: string;
  type: TeamType;
  designation?: string;
  content?: string;
  status?: ContentStatus;
  metaTitle?: string;
  metaDescription?: string;
  schemaCode?: string;
};

export type CreateTeamPayload = TeamFields;
export type UpdateTeamPayload = Partial<TeamFields>;


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
  annualReportMobileBanner?: string | null;
  annualReportFile?: string | null;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnnualReportFields = SeoFields & {
  title: string;
  slug: string;
  reportYear?: string;
  status?: ContentStatus;
};

export type Award = {
  id: string;
  title: string;
  year?: number | null;
  description?: string | null;
  awardImageUrl: string;
  displayOrder: number;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AwardFields = {
  title: string;
  year?: string;
  description?: string;
  displayOrder?: string;
  status?: ContentStatus;
};

export type HomeBanner = {
  id: string;
  name: string;
  title: string;
  location?: string | null;
  shortDescription?: string | null;
  bannerImageUrl: string;
  mobileBannerImageUrl?: string | null;
  profileImageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HomeBannerFields = {
  name: string;
  title: string;
  location?: string;
  shortDescription?: string;
  displayOrder: number;
  isActive: boolean;
};

export type UpdateHomeBannerPayload = Partial<HomeBannerFields>;

export type CmsEvent = SeoFields & {
  id: string;
  title: string;
  slug: string;
  eventBanner?: string | null;
  eventMobileBanner?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  eventTime?: string | null;
  content?: string | null;
  shortDescription?: string | null;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventFields = SeoFields & {
  title: string;
  slug: string;
  eventDate?: string;
  eventLocation?: string;
  eventTime?: string;
  content?: string;
  shortDescription?: string;
  status?: ContentStatus;
};

export type CmsProject = SeoFields & {
  id: string;
  title: string;
  slug: string;
  projectBanner?: string | null;
  projectMobileBanner?: string | null;
  projectDate?: string | null;
  content?: string | null;
  shortDescription?: string | null;
  displayOrder: number;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectFields = SeoFields & {
  title: string;
  slug: string;
  projectDate?: string;
  content?: string;
  shortDescription?: string;
  displayOrder?: number;
  status?: ContentStatus;
};

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
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientStoryFields = SeoFields & {
  title: string;
  slug: string;
  storyDate?: string;
  donationState?: string;
  content?: string;
  shortDescription?: string;
  status?: ContentStatus;
};

export type PatientTestimonial = SeoFields & {
  id: string;
  title: string;
  shortDescription?: string | null;
  patientTestimonialBanner?: string | null;
  patientTestimonialMobileBanner?: string | null;
  patientTestimonialFile?: string | null;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientTestimonialFields = SeoFields & {
  title: string;
  shortDescription?: string;
  status?: ContentStatus;
};

export type LegalPageType = "privacy_policy" | "terms_and_conditions";

export type LegalPage = SeoFields & {
  id: string;
  title: string;
  content?: string | null;
  status: ContentStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLegalPagePayload = SeoFields & {
  title: string;
  content: string;
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
  countryCode?: string | null;
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

export type CampaignStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export type FundraisingCampaign = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  fundraisingGoal: string;
  fundraisingReason: string;
  message?: string | null;
  termsAccepted: boolean;
  status: CampaignStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateFundraisingCampaignPayload = Partial<{
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  fundraisingGoal: string;
  fundraisingReason: string;
  message: string;
  termsAccepted: boolean;
  status: CampaignStatus;
}>;

export type InquiryStatus =
  | "pending"
  | "in_review"
  | "contacted"
  | "resolved"
  | "rejected";

export type PartnershipInquiry = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationName?: string | null;
  message: string;
  termsAccepted: boolean;
  status: InquiryStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdatePartnershipInquiryPayload = Partial<{
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationName: string;
  message: string;
  termsAccepted: boolean;
  status: InquiryStatus;
}>;

export type LeadsInternship = {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  dob?: string | null;
  currentCourse?: string | null;
  address?: string | null;
  languages?: string | null;
  computerSkills?: string | null;
  message?: string | null;
  termsAccepted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateLeadsInternshipPayload = Partial<{
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  currentCourse: string;
  address: string;
  languages: string;
  computerSkills: string;
  message: string;
  termsAccepted: boolean;
}>;

export type LeadsContact = {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateLeadsContactPayload = Partial<{
  fullName: string;
  phone: string;
  email: string;
  message: string;
}>;

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
  message?: string;
  statusCode?: number;
};

export type DashboardStats = {
  totalDonors: number;
  totalDonationsAmount: number;
  activeProjects: number;
  activeCampaigns: number;
  activeEvents: number;
  pendingPartnerships: number;
  totalUsers: number;
  recentDonations: any[]; // Or a specific Donor type if available
  topDonors: any[];
  recentContacts: {
    id: string;
    createdAt: string;
    fullName: string;
    email: string;
  }[];
};
