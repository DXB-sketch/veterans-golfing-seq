import { supabase } from "./supabase.js";
import { mapEvent } from "./eventModel.js";

export * from "./eventModel.js";

// On-now/upcoming first (soonest first, no-date last), then finalised (most recent first).
function sortEvents(events) {
  const current = events.filter((e) => e.timeStatus !== "finalised");
  const finalised = events.filter((e) => e.timeStatus === "finalised");
  current.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  finalised.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return [...current, ...finalised];
}

// Public pages never list drafts, even for a signed-in committee member
// (RLS lets them read drafts); the admin list asks for them explicitly.
export async function fetchEvents({ includeDrafts = false } = {}) {
  let query = supabase.from("events").select("*");
  if (!includeDrafts) query = query.neq("status", "draft");
  const { data, error } = await query;
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
