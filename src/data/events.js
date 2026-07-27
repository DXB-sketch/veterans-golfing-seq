// Mock event data for the visual mock-up.
// In V1 this is replaced by a live read from Supabase (see DESIGN.md §12).
// Only the Gold Coast Open Day is a real, confirmed event; the second 2026
// event is TBC from the client and is shown here as a placeholder card.
export const events = [
  {
    id: "gold-coast-open-day-2026",
    title: "Gold Coast Open Day",
    region: "Gold Coast",
    date: "2026-07-31",
    dateDisplay: "Friday 31 July 2026",
    venue: "Palmer Gold Coast Golf Course",
    address: "Ron Penhaligon Way, Robina QLD",
    meetTime: "8:30am",
    firstTee: "9:04am",
    holes: 18,
    greenFee: "$115 (shared cart)",
    sideComp: "$10 (handicap only)",
    status: "Upcoming",
    sponsor: "Palmer Gold Coast",
    description:
      "Our first official open day on the Gold Coast. 18 holes at Palmer Gold Coast, with an optional side competition for handicap players. All veterans — serving and ex-serving — and their families are welcome. Come for the golf, stay for the company.",
  },
  {
    id: "event-two-2026",
    title: "Second 2026 Event — Details Coming Soon",
    region: "Brisbane",
    date: "2026-10-01",
    dateDisplay: "Date to be confirmed",
    venue: "Venue to be confirmed",
    address: "",
    meetTime: "TBC",
    firstTee: "TBC",
    holes: 18,
    greenFee: "TBC",
    sideComp: "TBC",
    status: "Upcoming",
    sponsor: "",
    description:
      "We're locking in our second event for 2026. Follow us on Facebook or check back here — details will be posted as soon as they're confirmed.",
  },
];

export const regions = ["Brisbane", "Sunshine Coast", "Gold Coast"];
export const statuses = ["Upcoming", "Past"];
