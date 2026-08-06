// Per-route page titles and descriptions for the SPA. Applied by <PageMeta />
// in App.jsx on every route change; index.html carries the same defaults for
// crawlers that read the raw HTML.
export const SITE_NAME = "SEQDVGC";
export const BASE_URL = "https://www.seqdvgc.com.au";
export const DEFAULT_TITLE = "SEQDVGC | South East Queensland Defence Veterans Golf Club";
export const DEFAULT_DESCRIPTION =
  "The South East Queensland Defence Veterans Golf Club connects Australian Defence veterans and their families through golf across Brisbane, the Sunshine Coast and the Gold Coast. All veterans and abilities welcome.";

// Longest-prefix match against these entries; "/" is the fallback.
export const ROUTE_META = [
  {
    path: "/about",
    title: "About the Club, Sponsors & Partners",
    description:
      "Who we are, where the club is headed, the values we stand for, and the sponsors and partners backing Australian Defence veterans through golf.",
  },
  {
    path: "/events",
    title: "Golf Events & Open Days",
    description:
      "Upcoming SEQDVGC golf days and open events across Brisbane, the Sunshine Coast and the Gold Coast. All veterans, serving and ex-serving, and family welcome. Book your tee slot online.",
  },
  {
    path: "/gallery",
    title: "Photo Gallery",
    description: "Photos from SEQDVGC golf days and club events across South East Queensland.",
  },
  {
    path: "/membership",
    title: "Membership: Join the Club",
    description:
      "Join the South East Queensland Defence Veterans Golf Club for $50 a year. Open to all veterans, serving and ex-serving, and their family members. Join and pay online.",
  },
  {
    path: "/resources",
    title: "Veteran Resources",
    description:
      "Support services for Australian Defence veterans and their families: Open Arms, DVA, RSL Queensland, Soldier On and Golf Australia.",
  },
  {
    path: "/contact",
    title: "Contact & Volunteer",
    description:
      "Get in touch with the South East Queensland Defence Veterans Golf Club by email, contact form or Facebook, or put your hand up to volunteer.",
  },
  {
    path: "/donate",
    title: "Donate",
    description:
      "Support Australian Defence veterans and their families. Every dollar donated goes to SEQDVGC's veteran members and the events run for them.",
  },
  {
    path: "/wall-of-honour",
    title: "Wall of Honour",
    description:
      "Honouring the service and stories of the SEQDVGC veteran community across Army, Navy and Air Force.",
  },
  { path: "/privacy", title: "Privacy Policy" },
  { path: "/terms", title: "Terms of Use" },
  // Account and committee areas: real pages, but not for search results.
  { path: "/member", title: "Member Area", noindex: true },
  { path: "/admin", title: "Committee", noindex: true },
  { path: "/auth", title: "Account", noindex: true },
];

export function metaForPath(pathname) {
  let best = null;
  for (const entry of ROUTE_META) {
    if (pathname === entry.path || pathname.startsWith(`${entry.path}/`)) {
      if (!best || entry.path.length > best.path.length) best = entry;
    }
  }
  return best;
}
