import {
  Metadata,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

const INDIA_DIAL_DIGITS = "91";

export function maxNationalDigits(dialCode: string): number {
  const dialDigits = dialCode.replace(/\D/g, "");
  return dialDigits === INDIA_DIAL_DIGITS ? 10 : Math.max(6, 15 - dialDigits.length);
}

const metadata = new Metadata();
const longestByDial = new Map<string, number>();

/** Longest national number among the countries sharing this dialling code (+1: US, CA, …). */
function longestNationalNumber(dialDigits: string): number {
  const cached = longestByDial.get(dialDigits);
  if (cached !== undefined) return cached;
  let longest = 0;
  for (const country of getCountries()) {
    if (getCountryCallingCode(country) !== dialDigits) continue;
    metadata.selectNumberingPlan(country);
    longest = Math.max(longest, ...(metadata.numberingPlan?.possibleLengths() ?? []));
  }
  const result = longest || Infinity;
  longestByDial.set(dialDigits, result);
  return result;
}

/**
 * "971501234567" pasted for the UAE is code + number: too long to be a UAE
 * number, and valid once read as +971. Anything that could still be a national
 * number is left alone.
 */
function isInternationalForm(digits: string, dialDigits: string): boolean {
  if (digits.length <= longestNationalNumber(dialDigits)) return false;
  const international = parsePhoneNumberFromString(`+${digits}`);
  return !!international?.isValid() && international.countryCallingCode === dialDigits;
}

/**
 * Digits of the national number. The dialling code is removed only when the
 * value clearly includes it ("+91 98…", or code + a full number pasted), so
 * numbers that merely start with the same digits — e.g. 91084… in India — are
 * kept intact while typing, and extra keystrokes are simply ignored.
 *
 * Pass the field's previous value from onChange so pasted/autofilled numbers
 * without "+" can be recognised; keystrokes never go through that check, since
 * a half-typed number can look like code + number.
 */
export function nationalPhoneDigits(value: string, dialCode: string, previous?: string): string {
  const dialDigits = dialCode.replace(/\D/g, "");
  const max = maxNationalDigits(dialCode);
  const trimmed = value.trim();
  let digits = trimmed.replace(/\D/g, "");
  const pasted =
    previous !== undefined && digits.length - previous.replace(/\D/g, "").length > 1;

  if (
    dialDigits &&
    digits.startsWith(dialDigits) &&
    (trimmed.startsWith("+") ||
      digits.length >= dialDigits.length + max ||
      (pasted && isInternationalForm(digits, dialDigits)))
  ) {
    digits = digits.slice(dialDigits.length);
  }
  // Trunk prefix, e.g. 0 98450 12345
  if (digits.length > max && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, max);
}
