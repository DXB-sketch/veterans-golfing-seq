// Sponsorship tiers — Appendix A of the final build brief, locked.
// The server (api/_lib/tiers.js) holds the authoritative copy of the banding;
// this module is for display and live previews only.

export const TIERS = [
  {
    key: "platinum_plus",
    label: "Platinum Plus",
    grantsAtCents: 250000,
    priceLabel: "$2,500+",
    // Tier badge colours — navy-and-metal palette that sits on the site's cream cards.
    badgeClass: "bg-navy text-gold border border-gold",
    benefits: [
      "Prominent logo on the event website and printed flyers",
      "Social media posts",
      "Event shoutout",
      "2 people to play at 5 events",
    ],
  },
  {
    key: "platinum",
    label: "Platinum",
    grantsAtCents: 150000,
    priceLabel: "$1,500",
    badgeClass: "bg-slate-200 text-navy border border-slate-400",
    benefits: [
      "Platinum logo on the event website",
      "Social media posts",
      "Event shoutout",
      "2 people to play at 2 events",
    ],
  },
  {
    key: "gold",
    label: "Gold",
    grantsAtCents: 100000,
    priceLabel: "$1,000",
    badgeClass: "bg-gold/20 text-navy border border-gold",
    benefits: [
      "Gold logo on the event website",
      "Social media posts",
      "Event shoutout",
      "2 people to play at 1 event",
    ],
  },
  {
    key: "silver",
    label: "Silver",
    grantsAtCents: 50000,
    priceLabel: "$500",
    badgeClass: "bg-slate-100 text-ink border border-slate-300",
    benefits: ["Silver logo on the event website", "Social media post", "Event shoutout"],
  },
  {
    key: "bronze",
    label: "Bronze",
    grantsAtCents: 25000,
    priceLabel: "$250",
    badgeClass: "bg-amber-100 text-amber-900 border border-amber-700/40",
    benefits: ["Bronze-level logo on the event website", "One social media post"],
  },
];

// Ordered most prominent first — the sponsors page render order.
export const TIER_ORDER = TIERS.map((t) => t.key);

export function tierByKey(key) {
  return TIERS.find((t) => t.key === key) || null;
}

// Mirror of the server's banding, for live previews in the sponsor form.
export function tierFromAmountCents(cents) {
  if (!Number.isFinite(cents)) return null;
  if (cents >= 250000) return "platinum_plus";
  if (cents >= 150000) return "platinum";
  if (cents >= 100000) return "gold";
  if (cents >= 50000) return "silver";
  if (cents >= 25000) return "bronze";
  return null;
}

export const SPONSORSHIP_MIN_CENTS = 25000; // $250 — below this it's a donation
