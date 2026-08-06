import { supabase } from "./supabase.js";
import { TIER_ORDER } from "./tiers.js";

// Rank a tier key by prominence (Platinum Plus first). Unknown tiers sort last.
function tierRank(tier) {
  const i = TIER_ORDER.indexOf(tier);
  return i === -1 ? TIER_ORDER.length : i;
}

// Public sponsor list from the anon-readable public_sponsors view.
// Ordered by tier prominence, then display_order, then name.
// Returns [] on any failure — the page shows an empty state, never an error dump.
export async function fetchPublicSponsors() {
  try {
    const { data, error } = await supabase.from("public_sponsors").select("*");
    if (error || !Array.isArray(data)) return [];
    return [...data].sort(
      (a, b) =>
        tierRank(a.tier) - tierRank(b.tier) ||
        (a.display_order ?? 0) - (b.display_order ?? 0) ||
        (a.company_name || "").localeCompare(b.company_name || "")
    );
  } catch {
    return [];
  }
}

// Resolve a sponsors.logo_path to a URL the browser can load.
// Paths starting with "/" are files committed to public/ (e.g.
// "/sponsors/urban-fairways.png"); anything else is an object in the
// public "sponsor-logos" Supabase Storage bucket.
export function logoUrl(logoPath) {
  if (!logoPath) return null;
  if (logoPath.startsWith("/")) return logoPath;
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/sponsor-logos/${logoPath}`;
}
