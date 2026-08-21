import { supabase } from "./supabase.js";

// Tee-slot availability comes from a SECURITY DEFINER RPC so anonymous
// visitors can see spots taken without ever reading the bookings table.
export async function fetchSlotAvailability(eventId) {
  const { data, error } = await supabase.rpc("get_slot_availability", {
    p_event_id: eventId,
  });
  if (error) throw error;
  return (data ?? [])
    .map((row) => ({
      id: row.id,
      teeTime: row.tee_time,
      capacity: row.capacity,
      sortOrder: row.sort_order,
      spotsTaken: row.spots_taken,
      spotsLeft: Math.max(0, row.capacity - row.spots_taken),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// Anon-safe list of who's booked: first initial + last name per slot, via a
// SECURITY DEFINER RPC that never exposes mobiles or other details. Returns
// a map of tee_slot_id -> ["D. Bell", ...]. On any error (including the RPC
// not existing yet) we return an empty map; the booking form works without it.
export async function fetchSlotPlayers(eventId) {
  try {
    const { data, error } = await supabase.rpc("get_slot_players", {
      p_event_id: eventId,
    });
    if (error) return {};
    const bySlot = {};
    for (const row of data ?? []) {
      (bySlot[row.tee_slot_id] ??= []).push(row.display_name);
    }
    return bySlot;
  } catch {
    return {};
  }
}

// Anonymous insert. A BEFORE INSERT trigger enforces capacity server-side;
// we translate its error messages into codes the booking form can act on.
export async function createBooking({
  eventId,
  teeSlotId,
  playerName,
  mobile,
  gaHandicap,
  golfLinksNumber,
  playingInComp,
  cartHire,
}) {
  const { error } = await supabase.from("bookings").insert({
    event_id: eventId,
    tee_slot_id: teeSlotId,
    player_name: playerName,
    mobile,
    ga_handicap: gaHandicap,
    golf_links_number: golfLinksNumber,
    playing_in_comp: playingInComp,
    cart_hire: cartHire,
  });
  if (error) {
    const message = error.message || "";
    if (message.includes("SLOT_FULL")) {
      const err = new Error("That tee time just filled up.");
      err.code = "slot_full";
      throw err;
    }
    if (message.includes("EVENT_NOT_BOOKABLE")) {
      const err = new Error("Bookings aren't open for this event.");
      err.code = "not_bookable";
      throw err;
    }
    throw error;
  }
}

// Raw tee_slots rows, used by the admin sheet builder.
export async function fetchTeeSlots(eventId) {
  const { data, error } = await supabase
    .from("tee_slots")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

// Sync an event's tee sheet to match the given rows. Existing slots keep
// their id (so bookings on them survive — deleting a slot cascades away its
// bookings); removed slots are deleted, new ones inserted.
export async function syncTeeSlots(eventId, slots) {
  const keepIds = slots.filter((s) => s.id).map((s) => s.id);
  let deleteQuery = supabase.from("tee_slots").delete().eq("event_id", eventId);
  if (keepIds.length) {
    deleteQuery = deleteQuery.not("id", "in", `(${keepIds.join(",")})`);
  }
  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw deleteError;

  const existing = slots
    .filter((s) => s.id)
    .map((slot) => ({
      id: slot.id,
      event_id: eventId,
      tee_time: slot.tee_time,
      capacity: slot.capacity,
      sort_order: slot.sort_order,
    }));
  if (existing.length) {
    const { error: upsertError } = await supabase
      .from("tee_slots")
      .upsert(existing);
    if (upsertError) throw upsertError;
  }

  const fresh = slots
    .filter((s) => !s.id)
    .map((slot) => ({
      event_id: eventId,
      tee_time: slot.tee_time,
      capacity: slot.capacity,
      sort_order: slot.sort_order,
    }));
  if (fresh.length) {
    const { error: insertError } = await supabase
      .from("tee_slots")
      .insert(fresh);
    if (insertError) throw insertError;
  }
}

// Raw bookings rows — RLS only allows this for signed-in committee members.
export async function fetchEventBookings(eventId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

// Committee-only edit of a booking's details, including moving it to another
// tee slot. The capacity trigger raises SLOT_FULL if the target slot is full.
export async function updateBooking(id, fields) {
  const { error } = await supabase.from("bookings").update(fields).eq("id", id);
  if (error) {
    const message = error.message || "";
    if (message.includes("SLOT_FULL")) {
      const err = new Error("That tee time is already full.");
      err.code = "slot_full";
      throw err;
    }
    throw error;
  }
}

export async function deleteBooking(id) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}
