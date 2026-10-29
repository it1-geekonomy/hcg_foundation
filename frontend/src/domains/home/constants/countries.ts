import type { DonationCurrencyCode } from "@/domains/home/constants/donation-currency";
import { COUNTRY_ROWS } from "./countries.data";

export type DonationCountry = {
  code: string;
  name: string;
  dial: string;
  currency: DonationCurrencyCode;
};

/**
 * Preferred currency by country for Razorpay-supported codes.
 * Any other country falls back to USD.
 */
const CURRENCY_BY_COUNTRY: Record<string, DonationCurrencyCode> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  SG: "SGD",
  AU: "AUD",
  CA: "CAD",
  DE: "EUR",
  FR: "EUR",
  NL: "EUR",
  IE: "EUR",
  NZ: "AUD",
  MY: "SGD",
  QA: "AED",
  SA: "AED",
};

/** Shown near the top of the country picker (before A–Z). */
const PINNED_CODES = [
  "IN",
  "US",
  "GB",
  "AE",
  "SG",
  "AU",
  "CA",
  "DE",
  "FR",
  "NL",
  "IE",
  "NZ",
  "MY",
  "QA",
  "SA",
] as const;

const DEFAULT_CURRENCY: DonationCurrencyCode = "USD";
export const DEFAULT_COUNTRY_CODE = "IN";

function currencyForCountry(code: string): DonationCurrencyCode {
  return CURRENCY_BY_COUNTRY[code] ?? DEFAULT_CURRENCY;
}

const worldList: DonationCountry[] = COUNTRY_ROWS.map(([code, name, dial]) => ({
  code,
  name,
  dial,
  currency: currencyForCountry(code),
}));

const pinnedSet = new Set<string>(PINNED_CODES);

export const DONATION_COUNTRIES: DonationCountry[] = [
  ...PINNED_CODES.map(
    (code) => worldList.find((country) => country.code === code)!,
  ).filter(Boolean),
  ...worldList
    .filter((country) => !pinnedSet.has(country.code))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

const BY_CODE = Object.fromEntries(
  DONATION_COUNTRIES.map((country) => [country.code, country]),
) as Record<string, DonationCountry>;

export function getDonationCountry(code: string): DonationCountry {
  if (code && BY_CODE[code.toUpperCase()]) return BY_CODE[code.toUpperCase()];
  if (code && BY_CODE[code]) return BY_CODE[code];
  return (
    BY_CODE["IN"] || {
      code: "IN",
      name: "India",
      dial: "+91",
      currency: "INR",
    }
  );
}

export function isIndiaCountry(code: string) {
  return code === "IN";
}
