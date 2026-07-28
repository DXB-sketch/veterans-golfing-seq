import { supabase } from "./supabase.js";

// Region + status values as stored in the database, with the labels shown on site.
export const REGIONS = [
  { value: "brisbane", label: "Brisbane" },
  { value: "sunshine_coast", label: "Sunshine Coast" },
  { value: "gold_coast", label: "Gold Coast" },
];

export const STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "full", label: "Full" },
  { value: "past", label: "Past" },
];

export const regionLabel = (value) =>
  REGIONS.find((r) => r.value === value)?.label ?? value;

export const statusLabel = (value) =>
  STATUSES.find((s) => s.value === value)?.label ?? value;

const money = (n) => {
  if (n === null || n === undefined || n === "") return "TBC";
  const num = Number(n);
  return `$${Number.isInteger(num) ? num : num.toFixed(2)}`;
};

export function formatEventDate(iso) {
  if (!iso) return "Date to be confirmed";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Shape a database row into the object the existing components render.
export function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    region: regionLabel(row.region),
    regionValue: row.region,
    date: row.event_date || "",
    dateDisplay: formatEventDate(row.event_date),
    venue: row.venue || "TBC",
    address: row.address || "",
    meetTime: row.meet_time || "TBC",
    firstTee: row.first_tee || "TBC",
    holes: row.holes ?? 18,
    greenFee: money(row.green_fee),
    sideComp: row.side_comp === null || row.side_comp === undefined ? "None" : money(row.side_comp),
    status: statusLabel(row.status),
    statusValue: row.status,
    sponsor: row.sponsor || "",
    description: row.description || "",
    imageUrl: row.image_url || "",
  };
}

// Upcoming/full first (soonest first, no-date last), then past (most recent first).
function sortEvents(events) {
  const upcoming = events.filter((e) => e.statusValue !== "past");
  const past = events.filter((e) => e.statusValue === "past");
  upcoming.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  past.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return [...upcoming, ...past];
}

export async function fetchEvents() {
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw error;
  return sortEvents(data.map(mapEvent));
}

export async function fetchEvent(id) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEvent(data) : null;
}
