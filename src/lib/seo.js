// Search-engine helpers shared by the app (client-side, for events added
// since the last deploy) and scripts/prerender.mjs (static HTML per route at
// build time). Pure: no browser or Supabase imports.
import { BASE_URL } from "./meta.js";

const CLUB = {
  "@type": "SportsOrganization",
  name: "South East Queensland Defence Veterans Golf Club Inc.",
  url: `${BASE_URL}/`,
};

// "8:30am" / "9:04 AM" / "14:30" -> "08:30", or null.
function to24h(text) {
  const m = String(text ?? "")
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const clip = (text, max) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;

// Title + description for an event page (takes a mapEvent() object).
export function eventMeta(event) {
  const where = [event.venue !== "TBC" ? event.venue : null, event.region]
    .filter(Boolean)
    .join(", ");
  const intro = `${event.dateDisplay}${where ? ` at ${where}` : ""}.`;
  const fee = event.greenFee !== "TBC" ? ` Green fees ${event.greenFee}.` : "";
  const body = event.description ? ` ${event.description}` : " All veterans and their families welcome.";
  return {
    title: event.title,
    description: clip(`${intro}${fee}${body}`, 158),
  };
}

// schema.org SportsEvent for Google's event results.
export function eventJsonLd(event) {
  const url = `${BASE_URL}/events/${event.id}`;
  const time = to24h(event.meetTime) ?? to24h(event.firstTee);
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.title,
    sport: "Golf",
    url,
    image: [`${BASE_URL}/og-image.png`],
    description: eventMeta(event).description,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: CLUB,
    location: {
      "@type": "Place",
      name: event.venue !== "TBC" ? event.venue : event.region,
      address: {
        "@type": "PostalAddress",
        ...(event.address ? { streetAddress: event.address } : {}),
        addressRegion: "QLD",
        addressCountry: "AU",
      },
    },
  };
  if (event.date) {
    // Brisbane is UTC+10 all year (no daylight saving).
    data.startDate = time ? `${event.date}T${time}:00+10:00` : event.date;
    data.endDate = event.date;
  }
  if (event.greenFeeCents > 0) {
    data.offers = {
      "@type": "Offer",
      price: (event.greenFeeCents / 100).toFixed(2),
      priceCurrency: "AUD",
      url: `${url}#book`,
      availability:
        event.isFull || event.timeStatus === "finalised"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
    };
  }
  return data;
}
