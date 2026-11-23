/**
 * Foreign / FCRA donations are handled manually by the Finance team.
 * Online payment gateways cannot automate international donations for this account.
 */
export const FINANCE_TEAM_EMAIL = "accounts.hcgf@hcgel.com";
export const FINANCE_TEAM_LABEL = "HCG Foundation Finance Team";

/** Kept for chatbot / internal reference; not shown on the public foreign-donation screen. */
export const FCRA_BANK = {
  accountName: "M/S HCG FOUNDATION",
  bankName: "State Bank of India (SBI)",
  accountType: "FCRA Current Account",
  accountNumber: "40676010670",
  ifsc: "SBIN0000691",
  swift: "SBININBB104",
  branch: "New Delhi Main Branch — FCRA Cell",
  address: "11, Sansad Marg / Parliament Street, New Delhi - 110001",
  branchPhone: "011-23374390 / 4392 / 4143",
  branchEmail: "fcra.00691@sbi.co.in",
} as const;

export type DonationOrigin = "india" | "outside";

export const OUTSIDE_INDIA_COUNTRY_CODE = "US";
export const OUTSIDE_INDIA_CURRENCY = "USD" as const;
