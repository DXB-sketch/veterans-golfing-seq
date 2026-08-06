import { supabase } from "./supabase.js";

// Fields a member is allowed to change themselves. Status, expiry, email and
// auth linkage are locked server-side by the members_guard trigger — we also
// never send them so a stray value can't trip the guard.
const EDITABLE_FIELDS = [
  "name",
  "phone",
  "service_branch",
  "ga_handicap",
  "golf_links_number",
];

// The signed-in user's own members row, or null when they don't have one
// (e.g. a committee-only account). RLS scopes what "own" means (auth link or
// email match); we filter explicitly too so a committee account — whose
// policy can read every row — still only sees its own record here.
export async function fetchOwnMember() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  // Fall back to an email match for rows not yet linked to the auth user.
  const email = session.user.email;
  if (!email) return null;
  const { data: byEmail, error: emailError } = await supabase
    .from("members")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  if (emailError) throw emailError;
  return byEmail ?? null;
}

// Update the signed-in member's own row — only the self-service fields.
export async function updateOwnMember(memberId, fields) {
  const patch = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in fields) patch[key] = fields[key];
  }
  const { data, error } = await supabase
    .from("members")
    .update(patch)
    .eq("id", memberId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Bookings this user made while signed in, newest event first, with the
// event title/date and tee time pulled in via nested relations. RLS already
// scopes reads, but committee accounts can read everything — the explicit
// created_by filter keeps this list personal for them too.
export async function fetchOwnBookings() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, player_name, playing_in_comp, cart_hire, created_at, tee_slots ( tee_time ), events ( id, title, event_date )"
    )
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    playerName: row.player_name,
    playingInComp: row.playing_in_comp,
    cartHire: row.cart_hire,
    teeTime: row.tee_slots?.tee_time ?? null,
    eventId: row.events?.id ?? null,
    eventTitle: row.events?.title ?? "Club event",
    eventDate: row.events?.event_date ?? null,
  }));
}
