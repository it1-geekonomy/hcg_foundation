import { getDonationCountry } from "@/domains/home/constants/countries";

export type DonationCurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "AED"
  | "SGD"
  | "AUD"
  | "CAD";

export type DonationCurrency = {
  code: DonationCurrencyCode;
  label: string;
  symbol: string;
  /** Preset amounts in major units (e.g. rupees / dollars). */
  presets: number[];
};

export const DONATION_CURRENCIES: DonationCurrency[] = [
  { code: "INR", label: "INR – Indian Rupee", symbol: "₹", presets: [500, 1500, 2500, 5000] },
  { code: "USD", label: "USD – US Dollar", symbol: "$", presets: [10, 25, 50, 100] },
  { code: "EUR", label: "EUR – Euro", symbol: "€", presets: [10, 25, 50, 100] },
  { code: "GBP", label: "GBP – British Pound", symbol: "£", presets: [10, 25, 50, 100] },
  { code: "AED", label: "AED – UAE Dirham", symbol: "د.إ", presets: [50, 100, 250, 500] },
  { code: "SGD", label: "SGD – Singapore Dollar", symbol: "S$", presets: [15, 30, 75, 150] },
  { code: "AUD", label: "AUD – Australian Dollar", symbol: "A$", presets: [15, 30, 75, 150] },
  { code: "CAD", label: "CAD – Canadian Dollar", symbol: "C$", presets: [15, 30, 75, 150] },
];

export const DEFAULT_DONATION_CURRENCY: DonationCurrencyCode = "INR";

const CURRENCY_BY_CODE = Object.fromEntries(
  DONATION_CURRENCIES.map((c) => [c.code, c]),
) as Record<DonationCurrencyCode, DonationCurrency>;

export function isDonationCurrency(code: string): code is DonationCurrencyCode {
  return code in CURRENCY_BY_CODE;
}

export function getDonationCurrency(code: string): DonationCurrency {
  if (isDonationCurrency(code)) return CURRENCY_BY_CODE[code];
  return CURRENCY_BY_CODE[DEFAULT_DONATION_CURRENCY];
}

export function defaultCurrencyForCountry(countryCode: string): DonationCurrencyCode {
  return getDonationCountry(countryCode).currency;
}

export function formatDonationAmount(
  amount: number,
  currencyCode: string,
  locale = "en-IN",
): string {
  const currency = getDonationCurrency(currencyCode);
  const formatted = amount.toLocaleString(
    currency.code === "INR" ? "en-IN" : locale,
  );
  return `${currency.symbol}${formatted}`;
}

/** Razorpay expects amount in the smallest currency unit (paise / cents). */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}
