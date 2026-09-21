/** Shared donation currency rules for Razorpay national + international orders. */

export const DONATION_CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'SGD',
  'AUD',
  'CAD',
] as const;

export type DonationCurrency = (typeof DONATION_CURRENCIES)[number];

export function isDonationCurrency(value: string): value is DonationCurrency {
  return (DONATION_CURRENCIES as readonly string[]).includes(value);
}

export function normalizeDonationCurrency(
  value: string | undefined | null,
  isInternational: boolean,
): DonationCurrency {
  const raw = (value || '').toUpperCase().trim();
  if (isDonationCurrency(raw)) return raw;
  return isInternational ? 'USD' : 'INR';
}

/** Convert major units (e.g. 50.00 USD) to Razorpay minor units. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}
