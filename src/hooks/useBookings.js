import { useCallback, useEffect, useState } from "react";
import {
  fetchSlotAvailability,
  fetchSlotPlayers,
  fetchEventBookings,
} from "../lib/bookings.js";

// Anonymous-safe tee sheet availability. refresh() re-fetches in place,
// keeping the previous slots on screen while the new data loads.
export function useSlotAvailability(eventId) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSlotAvailability(eventId)
      .then((data) => {
        if (!cancelled) {
          setSlots(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load tee times right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { slots, loading, error, refresh };
}

// Anonymous-safe names per slot (first initial + last name), keyed by
// tee_slot_id. Quietly stays empty if the list can't be loaded.
export function useSlotPlayers(eventId) {
  const [players, setPlayers] = useState({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSlotPlayers(eventId).then((data) => {
      if (!cancelled) setPlayers(data);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { players, refresh };
}

// Committee-only booking list for an event.
export function useEventBookings(eventId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchEventBookings(eventId)
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load bookings right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { bookings, loading, error, refresh };
}
