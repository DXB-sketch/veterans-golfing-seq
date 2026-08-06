import { supabase } from "./supabase.js";

// Region + status values as stored in the database, with the labels shown on site.
export const REGIONS = [
  { value: "brisbane", label: "Brisbane" },
  { value: "sunshine_coast", label: "Sunshine Coast" },
  { value: "gold_coast", label: "Gold Coast" },
];

// Timing is derived from the event date/time, never stored. The database
// `status` column tracks lifecycle ('draft' | 'published' | 'completed');
// 'completed' forces the timing to finalised.
export const TIME_STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "on_now", label: "On now" },
  { value: "finalised", label: "Finalised" },
];

export const regionLabel = (value) =>
  REGIONS.find((r) => r.value === value)?.label ?? value;

export const timeStatusLabel = (value) =>
  TIME_STATUSES.find((s) => s.value === value)?.label ?? value;

// Club events run in south-east Queensland: AEST (UTC+10) year round,
// no daylight saving — so this clock is exact regardless of the visitor's
// own time zone.
const BRISBANE_TZ = "Australia/Brisbane";

function brisbaneNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRISBANE_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

// Meet/tee times are free text ("8:30am", "9:04 AM", "14:30").
function parseTimeToMinutes(text) {
  if (!text) return null;
  const m = String(text)
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2] ?? 0);
  if (m[3] === "pm" && hours !== 12) hours += 12;
  if (m[3] === "am" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// upcoming: before the day, or before the meet/tee time on the day.
// on_now: during the day itself (from meet time, or all day if no time given).
// finalised: any day after the event date, midnight AEST onwards.
export function eventTimeStatus(eventDate, meetTime, firstTee) {
  if (!eventDate) return "upcoming";
  const now = brisbaneNow();
  if (eventDate > now.date) return "upcoming";
  if (eventDate < now.date) return "finalised";
  const start = parseTimeToMinutes(meetTime) ?? parseTimeToMinutes(firstTee);
  if (start !== null && now.minutes < start) return "upcoming";
  return "on_now";
}

export const money = (n) => {
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
  // A completed event is finalised no matter what the clock says.
  const timeStatus =
    row.status === "completed"
      ? "finalised"
      : eventTimeStatus(row.event_date, row.meet_time, row.first_tee);
  return {
    id: row.id,
    title: row.title,
    region: regionLabel(row.region),
    regionValue: row.region,
    date: row.event_date || "",
    dateDisplay: formatEventDate(row.event_date),
    venue: row.venue || "TBC",
    address: row.address || "",
    course: row.course || "",
    meetTime: row.meet_time || "TBC",
    firstTee: row.first_tee || "TBC",
    holes: row.holes ?? 18,
    greenFee: money(row.green_fee),
    cartFee: row.cart_fee === null || row.cart_fee === undefined ? "None" : money(row.cart_fee),
    sideComp: row.side_comp === null || row.side_comp === undefined ? "None" : money(row.side_comp),
    // Raw cents for the online-payment total (display only — the server
    // re-prices every booking from the event row).
    greenFeeCents: Math.round(Number(row.green_fee || 0) * 100),
    cartFeeCents: Math.round(Number(row.cart_fee || 0) * 100),
    sideCompCents: Math.round(Number(row.side_comp || 0) * 100),
    sideCompNote: row.side_comp_note || "",
    status: timeStatusLabel(timeStatus),
    timeStatus,
    lifecycle: row.status,
    isLocked: !!row.is_locked,
    isFull: row.is_full === true && timeStatus !== "finalised",
    bookable: row.status === "published" && !!row.is_locked && timeStatus !== "finalised",
    sponsor: row.sponsor || "",
    description: row.description || "",
    imageUrl: row.image_url || "",
  };
}

// On-now/upcoming first (soonest first, no-date last), then finalised (most recent first).
function sortEvents(events) {
  const current = events.filter((e) => e.timeStatus !== "finalised");
  const finalised = events.filter((e) => e.timeStatus === "finalised");
  current.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  finalised.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return [...current, ...finalised];
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
