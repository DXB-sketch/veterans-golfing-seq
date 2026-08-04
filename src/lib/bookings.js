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

// Replace an event's tee sheet wholesale (only safe for draft events,
// before any bookings exist).
export async function replaceTeeSlots(eventId, slots) {
  const { error: deleteError } = await supabase
    .from("tee_slots")
    .delete()
    .eq("event_id", eventId);
  if (deleteError) throw deleteError;
  if (!slots.length) return;
  const { error: insertError } = await supabase.from("tee_slots").insert(
    slots.map((slot) => ({
      event_id: eventId,
      tee_time: slot.tee_time,
      capacity: slot.capacity,
      sort_order: slot.sort_order,
    }))
  );
  if (insertError) throw insertError;
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

export async function deleteBooking(id) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}
