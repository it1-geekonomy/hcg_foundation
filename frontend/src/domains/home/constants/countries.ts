import { getCountryCallingCode, isSupportedCountry } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import worldCountries from "world-countries";
import type { DonationCurrencyCode } from "@/domains/home/constants/donation-currency";

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

function toDial(cca2: string, root?: string, suffixes?: string[]) {
  let dial = "";

  if (isSupportedCountry(cca2 as CountryCode)) {
    dial = `+${getCountryCallingCode(cca2 as CountryCode)}`;
  } else if (root) {
    if (suffixes?.length === 1) {
      const combined = `${root}${suffixes[0]}`;
      const digits = combined.replace(/\D/g, "");
      dial = digits.length <= 4 ? combined : root;
    } else {
      dial = root;
    }
  }

  // NANP territories (e.g. Jamaica +1876). US/CA stay +1.
  if (
    dial === "+1" &&
    cca2 !== "US" &&
    cca2 !== "CA" &&
    suffixes?.length === 1 &&
    /^\d{3}$/.test(suffixes[0])
  ) {
    return `+1${suffixes[0]}`;
  }

  return dial;
}

function currencyForCountry(code: string): DonationCurrencyCode {
  return CURRENCY_BY_COUNTRY[code] ?? DEFAULT_CURRENCY;
}

const worldList: DonationCountry[] = worldCountries
  .map((country) => ({
    code: country.cca2,
    name: country.name.common,
    dial: toDial(country.cca2, country.idd?.root, country.idd?.suffixes),
    currency: currencyForCountry(country.cca2),
  }))
  .filter((country) => country.code && country.dial);

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
  if (BY_CODE[code]) return BY_CODE[code];
  // Unknown / legacy "OTHER" → USD international
  return {
    code: code || "XX",
    name: "Other / International",
    dial: "+",
    currency: DEFAULT_CURRENCY,
  };
}

export function isIndiaCountry(code: string) {
  return code === "IN";
}
