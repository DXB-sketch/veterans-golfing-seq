// Post-build SEO pass (runs after `vite build`, see package.json).
//
// The site is a single-page app, so every URL is served the same
// dist/index.html. Crawlers and link previews that don't run JavaScript
// (Facebook, Messenger, LinkedIn, some search engines) would see the home
// page's title and description everywhere. This writes a copy of index.html
// per public route — dist/about/index.html etc., which Vercel serves ahead of
// the SPA rewrite — with that page's title, description, canonical URL and
// social tags, plus schema.org data for each event. It also builds
// sitemap.xml from the routes and the live, published events.
//
// Event data is read with the public anon key (RLS: non-draft events only).
// If Supabase can't be reached the build still succeeds, just without the
// per-event pages; the app sets event meta client-side either way.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "vite";
import {
  BASE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  ROUTE_META,
} from "../src/lib/meta.js";
import { mapEvent } from "../src/lib/eventModel.js";
import { eventMeta, eventJsonLd } from "../src/lib/seo.js";

const DIST = path.resolve("dist");
const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };

const escapeAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON inside <script>: stop "</script>" in user text from closing the tag.
const safeJson = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

function renderPage(template, { title, description, urlPath, heading, jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${BASE_URL}${urlPath === "/" ? "/" : urlPath}`;
  const setMeta = (html, attr, key, value) =>
    html.replace(
      new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`),
      // Function replacers throughout: fees like "$115" in a string
      // replacement would be read as "$1" + "15".
      (_m, open, close) => `${open}${escapeAttr(value)}${close}`
    );

  let html = template.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeText(fullTitle)}</title>`);
  // index.html wraps some content attributes over lines; normalise those tags first.
  html = html.replace(/<meta\s+([a-z]+)="([^"]+)"\s+content="([^"]*)"\s*\/>/gs, (_m, a, k, c) =>
    `<meta ${a}="${k}" content="${c.replace(/\s+/g, " ").trim()}" />`
  );
  html = setMeta(html, "name", "description", desc);
  html = setMeta(html, "property", "og:title", fullTitle);
  html = setMeta(html, "property", "og:description", desc);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", fullTitle);
  html = setMeta(html, "name", "twitter:description", desc);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_m, open, close) => `${open}${url}${close}`);
  if (jsonLd) {
    html = html.replace(
      "</head>",
      () => `  <script type="application/ld+json" id="event-jsonld">${safeJson(jsonLd)}</script>\n  </head>`
    );
  }
  // Plain-HTML heading + summary for crawlers that don't run JavaScript;
  // React replaces #root's contents on load.
  html = html.replace(
    '<div id="root"></div>',
    () => `<div id="root"><noscript><h1>${escapeText(heading || title || SITE_NAME)}</h1><p>${escapeText(desc)}</p><p>Please enable JavaScript to use this website.</p></noscript></div>`
  );
  return html;
}

async function writeRoute(urlPath, html) {
  const dir = path.join(DIST, urlPath);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html);
}

async function fetchEvents() {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/events?select=*&status=neq.draft`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).map((row) => ({ ...mapEvent(row), updatedAt: row.updated_at }));
  } catch (err) {
    console.warn(`[prerender] events not fetched (${err.message}); skipping event pages`);
    return [];
  }
}

const template = await readFile(path.join(DIST, "index.html"), "utf8");
const publicRoutes = ROUTE_META.filter((r) => !r.noindex);

// Home keeps index.html as-is apart from the crawler fallback text.
await writeFile(
  path.join(DIST, "index.html"),
  renderPage(template, { urlPath: "/", heading: "South East Queensland Defence Veterans Golf Club" })
);
for (const r of publicRoutes) {
  await writeRoute(r.path, renderPage(template, { title: r.title, description: r.description, urlPath: r.path }));
}

const events = await fetchEvents();
for (const ev of events) {
  const urlPath = `/events/${ev.id}`;
  const meta = eventMeta(ev);
  await writeRoute(
    urlPath,
    renderPage(template, { ...meta, heading: ev.title, urlPath, jsonLd: eventJsonLd(ev) })
  );
}

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  ...publicRoutes.map((r) => ({
    loc: r.path,
    priority: r.path === "/events" || r.path === "/membership" ? "0.9" : r.path === "/privacy" || r.path === "/terms" ? "0.3" : "0.7",
    changefreq: r.path === "/events" ? "daily" : "monthly",
  })),
  ...events.map((ev) => ({
    loc: `/events/${ev.id}`,
    lastmod: (ev.updatedAt || "").slice(0, 10) || today,
    priority: ev.timeStatus === "finalised" ? "0.4" : "0.8",
    changefreq: ev.timeStatus === "finalised" ? "yearly" : "weekly",
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${BASE_URL}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
await writeFile(path.join(DIST, "sitemap.xml"), sitemap);
console.log(`[prerender] ${publicRoutes.length + 1} routes + ${events.length} events; sitemap has ${urls.length} URLs`);
