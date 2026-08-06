// AUTHORITATIVE sponsorship tier banding (Appendix A). The client has a
// display mirror in src/lib/tiers.js; only this file decides what a payment
// actually buys.

export const SPONSORSHIP_MIN_CENTS = 25000; // $250

export function tierFromAmountCents(cents) {
  if (!Number.isInteger(cents)) return null;
  if (cents >= 250000) return "platinum_plus";
  if (cents >= 150000) return "platinum";
  if (cents >= 100000) return "gold";
  if (cents >= 50000) return "silver";
  if (cents >= 25000) return "bronze";
  return null;
}
