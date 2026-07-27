# SEQDVGC — DESIGN.md

**South East Queensland Defence Veterans Golf Club Inc. — website design system & build spec.**

This file is the single source of visual truth for the build. Claude Code should read it before writing any UI, and every colour, type, spacing and component decision on the site should trace back to a token defined here. When something isn't specified, prefer the quieter option — this brand earns its impact through restraint, not decoration.

Stack: React/JSX + Tailwind, deployed on Vercel. Events data comes from Supabase (see §12). Payments are Square only — never build custom payment processing.

---

## 1. Who this is for (design north star)

- **Audience:** Australian Defence veterans — serving and ex-serving — and their families, across South East Queensland. Skews 40s–70s. Assume some users have reduced vision or motor control. Legibility and large tap targets are not optional.
- **Feeling:** dignified, warm, welcoming, unmistakably *service*. Ceremonial without being cold. Mateship, not marketing.
- **The homepage's one job:** make a veteran feel this is for them, and get them to either **join** or **see the next event**. Everything else is secondary.
- **The rule that governs everything:** the client felt the first concept (Image 1) was *"a bit busy."* Fix it by pushing detail onto inner pages and letting the homepage breathe. If a section feels crowded, cut an element — don't shrink it.

---

## 2. Design principles

1. **Ceremonial restraint.** Navy and gold do the heavy lifting; crimson is a rare punctuation, never a field of colour. Lots of negative space. One bold thing per screen.
2. **The ribbon is the spine.** A campaign-medal ribbon rule (see §6) is the site's signature — it appears under eyebrows, section titles and between major sections. It's the one recurring motif; don't add competing decorative flourishes.
3. **Hierarchy over density.** A clear eyebrow → title → ribbon → content rhythm on every section. Teasers on the homepage; full detail on inner pages.
4. **Respect the services.** Army, Navy, Air Force are equal. Never rank, crop or restyle service insignia. Treat the crest and any official emblems as sacred assets.
5. **Real over stock.** Favour genuine photos of the club and its people (coming from the 31 July event). Avoid corporate-handshake stock. Warm dawn/dusk Australian light matches the existing materials.

---

## 3. Colour tokens

Pulled from the crest (Image 5) and the flyers/flag (Images 2–4). Named, fixed, and the only colours allowed on the site.

| Token | Hex | Role |
|---|---|---|
| `navy` | `#0B1E3F` | Primary brand. Header, footer, dark sections, hero overlay. |
| `navy-deep` | `#07152B` | Darkest base — footer floor, image overlays, deep panels. |
| `gold` | `#C8A02E` | Primary accent. Buttons, rules, icon strokes, active nav. |
| `gold-bright` | `#E4C158` | Hover/focus highlight, small glints. Never large fills. |
| `crimson` | `#A81E27` | Rare accent — one primary CTA ("Support our mission"), alerts, ribbon centre. Use sparingly. |
| `sky` | `#5E93C4` | Trace accent from the crest's light-blue stripe. Illustration/detail only — **not** a UI surface colour. |
| `cream` | `#F5F0E4` | Light section background (matches flyer info panels). |
| `paper` | `#FFFFFF` | Cards on cream, form fields. |
| `ink` | `#14243D` | Body text on light backgrounds (navy-charcoal, softer than black). |
| `ink-muted` | `#4A5B72` | Secondary text, captions, metadata. |

**Contrast rules (WCAG-conscious for an older audience):**
- On `navy`/`navy-deep`: text is `#FFFFFF` or `cream`. Use `gold` only for headings, labels, icons and large text — never small body copy (it fails contrast at small sizes).
- `crimson` is a *fill* with white text, never crimson text on navy.
- Body text on light is `ink`, minimum 16px.
- Don't communicate anything with colour alone (e.g. event status also needs a label).

---

## 4. Typography

Two families do everything. A third is an optional, single-use flourish.

- **Display — `Oswald`** (condensed, uppercase, military-athletic; echoes the flyer headlines). Weights 500/600/700. Used for hero, page titles, section headings, eyebrows, buttons.
- **Body/UI — `Source Sans 3`** (warm, institutional, highly legible). Weights 400/600/700. All paragraphs, form fields, nav links, metadata.
- **Flourish — `Yellowtail`** (script, mirrors the "Golf Club" mark in the logo). **Optional, at most once per page**, and only as decoration (e.g. a sub-line on the About hero). If in doubt, leave it out — script reads cheesy when overused.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Yellowtail&display=swap" rel="stylesheet">
```

**Type scale** (use `clamp()` so it holds on mobile):

| Role | Font / weight | Size | Notes |
|---|---|---|---|
| Hero line | Oswald 700 | `clamp(2.25rem, 5vw, 4rem)` | Uppercase, line-height 1.02, tracking ~0.01em |
| Page title (H1) | Oswald 700 | `clamp(2rem, 4vw, 2.75rem)` | Uppercase |
| Section (H2) | Oswald 600 | `1.75rem` | Uppercase, sits above a ribbon rule |
| Card title (H3) | Oswald 600 | `1.25rem` | Small-caps feel; sentence or upper |
| Eyebrow/label | Oswald 500 | `0.8125rem` | Uppercase, tracking `0.14em`, colour `gold` |
| Body | Source Sans 3 400 | `1.0625rem` | line-height 1.6, max width ~68ch |
| Small/meta | Source Sans 3 600 | `0.875rem` | `ink-muted` |

Only `gold` eyebrows are uppercase-tracked; don't letter-space body copy.

---

## 5. Spacing, radius, shadow, motion

- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Section vertical padding: 64 mobile / 96 desktop. Content max-width **1200px**, gutters 20px.
- **Radius:** cards/buttons `10px`; pills/badges `999px`; images `12px`. Keep it consistent — mixed radii read messy.
- **Borders:** hairline `1px` at 12–15% opacity of `ink` (on light) or `gold` (on navy).
- **Shadow:** one soft elevation only — `0 6px 24px rgba(7,21,43,.10)`. No neon glows.
- **Motion (subtle, and always gated on `prefers-reduced-motion`):**
  - Nav link: gold underline wipes in on hover.
  - Cards: 2px lift + shadow deepen on hover.
  - Section reveal: 12px rise + fade on scroll-in, 400ms, once.
  - Buttons: 120ms colour/scale. Nothing bounces.

---

## 6. Signature element — the campaign-medal ribbon rule

The one motif that makes this site recognisably *SEQDVGC* and ties the web design to the crest and flags.

- A short horizontal bar of three stripes — **gold / crimson / navy** (or gold-centred on dark) — ~64px wide, 4px tall, radius 2px.
- **Under eyebrows and section titles** as a compact rule.
- **Between major sections** as a thin full-width divider: a 1px hairline with a centred 64px ribbon segment.
- On dark sections, swap the navy stripe for `gold-bright` so it stays visible.
- Keep it to this. It's the accent budget for the whole page — don't add laurel graphics, star scatters, or extra dividers on top of it.

```jsx
// <RibbonRule /> — the site's signature divider. Reuse everywhere; don't reinvent.
function RibbonRule({ className = "" }) {
  return (
    <span className={`inline-flex h-1 w-16 overflow-hidden rounded-sm ${className}`} aria-hidden="true">
      <span className="flex-1 bg-gold" />
      <span className="flex-1 bg-crimson" />
      <span className="flex-1 bg-navy" />
    </span>
  );
}
```

---

## 7. Logo & crest usage

- **Assets:** transparent PNG exists (`SEQDVGC-logo-transparent.png`). **Request the original vector/SVG** from the designer for crisp rendering at all sizes — until then, only display the PNG at or below its native size, never upscaled.
- **Clear space:** keep padding equal to the height of the "DEFENCE VETERANS" banner around the crest. Never crowd it with text.
- **Backgrounds:** the crest sits on navy, cream or white. Don't place it on gold, on a busy photo without a scrim, or recolour it.
- **Header lockup:** crest at left + stacked wordmark ("SOUTH EAST QUEENSLAND / **DEFENCE VETERANS** / GOLF CLUB INC.") — matches Image 1's header, which works well.
- **Don't:** stretch, add drop shadows, rotate, or place the crest and the script "Golf Club" flourish in the same block (competing focal points).

---

## 8. Photography & imagery direction

- **Hero style:** the Image 1 hero (veterans walking the fairway into dawn/dusk light) is the target mood — warm, human, Australian, from behind or wide so it's about the group, not portraits.
- **Treatment:** all photos on navy get a `navy-deep` gradient scrim (bottom-up, ~0→70%) so white/gold text stays legible.
- **Source:** real club photos are being captured at the 31 July 2026 event — build image slots **data-driven** so they drop in without layout changes. Use tasteful placeholders meanwhile; avoid generic corporate stock.
- **Never** publish faces without the club's ok. Respect and dignity over polish.

---

## 9. Component specs

Build these as reusable components; the pages in §10 assemble them.

- **Buttons**
  - *Primary:* `gold` fill, `navy-deep` text, Oswald 600 uppercase, radius 10px, 44px min height. Hover → `gold-bright`.
  - *Secondary:* transparent, 1.5px `gold` border, gold text on navy / navy text on light. Hover → subtle gold fill.
  - *Mission/donate (crimson):* `crimson` fill, white text. Only this one place uses crimson as a button.
  - Every button label is a verb the user recognises: "Join the club", "See what's on", "Send enquiry" — not "Submit".
- **Nav (sticky, navy):** crest lockup left; links right in Source Sans 3 600. Active link carries a gold underline + ribbon tick. Collapses to a full-height drawer on mobile (hamburger, 44px target). Keep the top-level count tight — Home, About, Events, Membership, Support Us, Resources, Contact. ("Gallery", "Wall of Honour", "Why Golf?" from Image 1 are Phase 2 / can live as inner sections, not top-level, to reduce clutter.)
- **Event card** (the homepage's one hero card): date chip, title, venue, meet/first-tee times, green fee, side comp, region badge, status badge (Upcoming/Full/Past), and a "View event" link. Icon + label rows like Image 4. This is the most important card on the site — give it room.
- **Teaser card:** icon, H3, one-sentence blurb, text link. Used in the homepage grid. Uniform height.
- **Value item:** gold line-icon, label (Oswald), one supporting line. A single quiet row — see the values note in §11.
- **Resource row:** logo/name, one-line description, external-link chevron. Opens in new tab with `rel="noopener"`.
- **Form field:** label above input, `paper` bg, 1px `ink`/15% border, gold focus ring (visible, 2px), generous 44px+ height, inline validation messages in `ink` with a crimson accent icon.
- **Footer (navy-deep):** mailing-list signup, Facebook link, quick links, contact (email + region only — see §11 constraints), ribbon rule, "Proudly supporting Defence veterans" line, ABN placeholder, copyright.
- **Section wrapper:** handles the eyebrow → title → `<RibbonRule/>` → content rhythm and alternates `navy` / `cream` backgrounds so sections read as distinct without borders.

---

## 10. Page blueprints

Content max-width 1200px unless noted. Wireframes are structure, not pixel layout.

### Home (fix the "busy")
```
┌───────────────────────────────────────────────┐
│ NAV  [crest] SEQDVGC ……… Home About Events …   │  sticky, navy
├───────────────────────────────────────────────┤
│ HERO  (dawn fairway photo, navy scrim)         │
│   eyebrow: FOR VETERANS · BY VETERANS          │
│   H1: CONNECTING DEFENCE VETERANS &            │
│       THEIR FAMILIES THROUGH GOLF              │
│   one short sentence of intro                  │
│   [ Join the club ]  [ See what's on ]         │  2 buttons only
├───────────────────────────────────────────────┤
│ NEXT EVENT  — single event card, generous      │  cream
├───────────────────────────────────────────────┤
│ VALUES — one quiet row of items                │  navy
├───────────────────────────────────────────────┤
│ TEASERS grid: About · Mission · Resources ·    │  cream
│              Membership   (icon+line+link)     │
├───────────────────────────────────────────────┤
│ FOOTER                                         │  navy-deep
└───────────────────────────────────────────────┘
```
Two CTAs in the hero, not four. Mission/merch/support move into the teaser grid or Support Us page. That's the whole fix.

### About
Story ("Who We Are", near-verbatim from approved copy) → Mission → **2026 Getting Started / 2027 The Vision** as a two-column or timeline block (source: Image 3) → Values (canonical set, see §11) → tri-service line (Army · Navy · Air Force, equal weight). Optional single `Yellowtail` flourish on the hero sub-line.

### Events
Filter bar (Region: Brisbane / Sunshine Coast / Gold Coast · Status: Upcoming / Past) → responsive grid of event cards, reading live from Supabase. Empty state: *"No events listed yet — check back soon or follow us on Facebook."* Must scale to the 2027 load (~25 events/yr across 3 regions + championship). Event detail page: full card + description + venue + "message us to secure your spot" (Facebook/email) for V1; Square entry in Phase 2.

### Membership
Warm intro (what you get: community + a hat or t-shirt, $50/yr) → enquiry/join form. **Draft fields (confirm with client):** name, email, phone, service branch, playing/handicap info, hat-or-shirt choice + size, pickup/delivery preference. V1 captures the enquiry; Square payment is Phase 2. Form posts to Supabase or an email endpoint — no money handled in V1.

### Veteran Resources
Short intro → resource rows for **Open Arms, DVA, RSL Queensland, Soldier On, Golf Australia** — each a one-line description (Dexter to write) + official external link. Respectful, plain, no marketing gloss.

### Contact
Email + contact form + Facebook Messenger + region ("South East Queensland"). **No phone. No street address.** (See §11.)

---

## 11. Content, voice & hard constraints

**Voice:** warm, plain, direct. Active verbs, sentence case in body, no jargon, no hype. "For veterans, by veterans."

**Approved taglines** (rotate, don't stack): *"Together we play. Together we grow."* · *"United by service. Connected by golf."* · *"For veterans. By veterans. For the community."*

**Values — UNRESOLVED, handle carefully.** The source materials disagree:
- Flag/posters: Mateship, Connection, Wellbeing + Honour, Service, Respect
- Web concept (Image 1): Mateship, Inclusion, Wellbeing, Respect, Community

→ Put the values in a **single data file** (`src/data/values.js`) so the canonical set can be swapped in one place once the client picks. Default placeholder = the Image 1 five, clearly marked `// TODO: confirm canonical values with client`.

**Do-not list (these are real requirements, not preferences):**
- ❌ **No phone number.** Image 1's `0400 123 456` is a placeholder — remove it. Email + Facebook + form only for V1.
- ❌ **Never publish the registered address** (7 Winnett Street, Woorim) — it's the client's home. Region only. Use a PO Box later if a mailing address is ever needed.
- ❌ **Fix the typo:** any carried-over "SEQDV**CC**" / "About SEQDVCC" must read "SEQDV**GC**".
- ❌ **Don't hardcode unconfirmed sponsors.** Palmer Gold Coast is a confirmed *event* sponsor; Invictus/La Trobe/"Your business could be here" in Image 1 are placeholders. Make sponsors a data-driven list and only render confirmed entries. Sponsor tiers/packages are Phase 2.
- ❌ **No custom payments.** Square only, in the **club's** account. A form captures info; Square handles money.
- ❌ **Don't invent facts, stats, testimonials, or event details.** Only the two 2026 events are real (Gold Coast Open Day is fully specified; the second is TBC).

**Gold Coast Open Day (real, use as the seed event):** Fri 31 July 2026, Palmer Gold Coast Golf Course, Ron Penhaligon Way, Robina QLD. Meet 8:30am, first tee 9:04am, 18 holes, green fees $115 (shared cart), side comp $10 (handicap only). All veterans + families welcome.

---

## 12. Technical notes for the build

- **Framework:** React/JSX + Tailwind, Vercel deploy. Configure the tokens from §3–5 in `tailwind.config.js` (extend `colors`, `fontFamily`, `borderRadius`, `boxShadow`) so classes like `bg-navy`, `text-gold`, `font-display` map to this system. Don't use arbitrary hex values in components — reference tokens only.
- **Fonts:** load the three Google Fonts (§4); set `font-display: swap`.
- **Events data — Supabase (Postgres):** a small password-protected admin page lets non-technical volunteers add/edit/delete events (fields: region, title, date, venue, address, meet_time, first_tee, holes, green_fee, side_comp, status, description, sponsor). The public Events + Home read from this table. Keep the schema flat and forgiving; volunteers are the users.
- **Forms:** membership/contact submissions to Supabase (or an email endpoint). Validate client-side, confirm success in plain language.
- **Ownership (bake into the plan, tell the client):** domain `seqdvgc.org.au` registered in the **club's** name (AU registrar, e.g. VentraIP); Square + bank in the **club's** name; ideally Vercel/Supabase on the club's own accounts long-term. Club owns the domain and self-manages events; design/code changes go through Dexter.
- **Accessibility floor (non-negotiable):** semantic HTML landmarks, visible gold focus rings, 44px tap targets, 16px+ body, alt text on every image, `prefers-reduced-motion` respected, colour never the only signal, keyboard-navigable nav drawer and forms.
- **Responsive:** mobile-first. Single column under 640px; event/teaser grids go 1→2→3 up the breakpoints. Test the hero headline wrap at 360px.

---

## 13. Suggested build order

1. Tailwind config + tokens + fonts + `<RibbonRule/>` and base primitives (Button, Section wrapper).
2. Nav + Footer (shared shell).
3. Home (hero, event card, values, teasers) — get the "not busy" feel right first; it sets the bar.
4. Supabase events table + admin page + Events list/detail reading live data.
5. About, Resources, Contact.
6. Membership enquiry form.
7. Polish pass: motion, focus states, mobile, alt text, copy review against §11.

Phase 2 (separate scope/quote): Square payments (membership, comp fees, donations), merch store (Square Online), sponsor packages, Wall of Honour.

---

*Everything here derives from the approved club materials (crest, flag, infographics, event flyer) and the project context. Where the client still owes a decision — canonical values, second 2026 event, sponsor tiers — the build isolates that choice in one place so it drops in cleanly later.*
