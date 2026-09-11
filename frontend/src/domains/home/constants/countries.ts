import { getCountryCallingCode, isSupportedCountry } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import worldCountries from "world-countries";

export type DonationCountry = {
  code: string;
  name: string;
  dialCode: string;
};

function toDialCode(cca2: string, root?: string, suffixes?: string[]) {
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

  // NANP territories (Jamaica +1876, American Samoa +1684). US/CA stay +1.
  if (
    dial === "+1" &&
    suffixes?.length === 1 &&
    /^\d{3}$/.test(suffixes[0])
  ) {
    return `+1${suffixes[0]}`;
  }

  return dial;
}

export const DONATION_COUNTRIES: DonationCountry[] = worldCountries
  .map((country) => ({
    code: country.cca2,
    name: country.name.common,
    dialCode: toDialCode(
      country.cca2,
      country.idd?.root,
      country.idd?.suffixes,
    ),
  }))
  .filter((country) => country.code && country.dialCode)
  .sort((a, b) => {
    if (a.code === "IN") return -1;
    if (b.code === "IN") return 1;
    return a.name.localeCompare(b.name);
  });

export const DEFAULT_COUNTRY_CODE = "IN";

export function getDonationCountry(code: string): DonationCountry {
  return (
    DONATION_COUNTRIES.find((country) => country.code === code) ??
    DONATION_COUNTRIES.find((country) => country.code === DEFAULT_COUNTRY_CODE)!
  );
}

export function isIndiaCountry(code: string) {
  return code === "IN";
}
