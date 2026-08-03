# Claude Code Brief — SEQDVGC Frontend Design

**Project:** South East Queensland Defence Veterans Golf Club Inc. (SEQDVGC) website
**Scope of this brief:** the frontend design system and Version 1 pages
**Stack:** React/JSX, Tailwind, Vercel, Supabase (events + admin)
**Author's note to Claude Code:** read this whole brief before writing any code. Do the two-pass planning described in "How to work" *first*, and show me the plan before you build the full site.

---

## 1. The one thing to get right

This is a **paid web development commission** for a real client (the developer's first paid external client), and it is **also intended for the developer's personal portfolio**. Both facts raise the bar at once: it must be delivered to a professional client standard, and it must be good enough to showcase alongside the developer's best work. It will sit next to a reference site the client likes. The reference (nqdefenceveteransgolf.com.au) is a real club we intend to merge with one day, so the result must feel like a *sibling* of it, not a clone, and it must be visibly better crafted.

The reference has a specific problem: it looks AI-generated. Our north star is to build something a designer would be proud to sign, using the same brand DNA (navy, gold, tri-service, golf, veteran gravitas) executed with real craft.

**Escape the category reflex.** "Veteran / military / defence org" plus "finance-adjacent trust" both point every generator at *navy + gold + an elegant contrast serif*. That is the first idea, so it is the wrong one to ship unexamined. We keep navy and gold as brand equity (the client asked for it, and it matters for the future merger) but we earn distinctiveness through typography, layout, imagery treatment and restraint, not through the palette.

---

## 2. Why the reference reads as generated (diagnosis to design against)

Study nqdefenceveteransgolf.com.au for *structure and familiarity only*. Do not copy its copy or its section-by-section layout. These are the tells to avoid repeating:

- **A single repeated section formula:** gold eyebrow label, huge centred heading with one word coloured gold, subheading, body line, button. Every section is the same shape.
- **Alternating dark-navy / cream bands** as the only structural idea. It creates rhythm by swapping background colour, not by changing layout.
- **Everything centred.** No grid, no asymmetry, no editorial tension.
- **Default serif-plus-sans pairing** that could belong to any club.
- **The one-word-in-gold headline trick** used everywhere.
- **A circle-check 2×2 feature grid** ("✓ Mateship & Camaraderie" etc.).
- **Emoji in event metadata** (📍 ⏰) instead of real iconography.
- **Date-block event cards** floating as identical rounded rectangles.
- **Photos darkened and dumped behind text**, muddy and low-contrast.

If our build shares three or more of these, we have failed.

---

## 3. Design system (start here, then validate — do not treat as final)

Build a small token system first. These are strong opinionated defaults; keep them unless the two-pass critique in §7 gives you a better, justified answer. Derive every colour and type decision from the tokens.

### 3.1 Colour

Colour strategy: **committed navy anchor + restrained gold accent + cool paper relief**, with heraldic red as rare tri-service punctuation. Navy carries the heavy anchor sections; gold stays under ~10% of any surface; red appears only in the signature motif and a few active states.

Work in OKLCH. Never use `#000` or `#fff`; tint every neutral toward navy. Starter palette (refine in OKLCH, keep hex as fallback):

| Role | Approx hex | Notes |
|---|---|---|
| Navy (anchor) | `#141E30` | Deeper and cooler than the reference `#1a2744`. Used for anchor sections, header, footer. |
| Navy-700 (raised) | `#1D2A40` | Cards/surfaces on navy, borders. |
| Gold (accent) | `#B8952E` | Muted heritage gold, not yellow. Rules, active states, small caps, the crest. Sparingly. |
| Paper (base) | `#EEF1F3` | Cool stone / fog. **Not** warm cream — warm cream + serif is itself an AI cliché. |
| Ink (text) | `#1B222D` | Body text on paper. |
| Ensign red (rare) | `#9E2B25` | Tri-service motif and the rare emphatic accent. Muted, not fire-engine. |
| Neutrals | tinted greys | All greys tinted toward navy hue at chroma ~0.006. |

Contrast: the audience skews older. Hit WCAG AA everywhere and aim for AAA on body text. Do not rely on gold-on-navy for anything that must be read at size; gold is for rules and accents, not body copy.

### 3.2 Typography

The palette stays familiar, so the *type* is where we break from the reflex. Do not ship a Playfair/Lora-style contrast serif as the display face; that is the exact default we are avoiding.

**Primary pairing (preferred):**
- **Display / headings:** `Archivo` (600–800). A grotesque with backbone and an expanded cut that reads like confident club signage rather than "elegant serif." Tight tracking on large sizes; used left-aligned, not centred.
- **Body / UI:** `Public Sans` or `IBM Plex Sans`. Institutional, highly legible, older-audience friendly, not generic.
- **Data / dates:** `IBM Plex Mono` for event dates, tee times, green fees, handicaps and scores. Golf is numeric, so monospaced tabular figures encode something *true* about the content, they are not decoration.

**Alternate pairing (if you can justify it beats the above):** a strong slab (e.g. `Roboto Slab` used with restraint) for display + a humanist sans for body. Only switch if the critique step shows it is more distinctive, and say why.

Type rules: cap body measure at 65–75ch. Build a real scale with ≥1.25 ratio between steps and deliberate weight contrast. Make the headline treatment itself memorable (tracking, weight, an expanded cut), not a neutral delivery vehicle.

### 3.3 Spacing, radius, elevation

- One spacing scale (8pt base). Vary section padding for rhythm; identical padding everywhere is monotony.
- Restrained radius. Not everything is a pill. Pick one small radius for interactive elements and mostly square edges elsewhere.
- Avoid drop-shadow-heavy floating cards. Prefer full borders, background shifts, and generous whitespace. Cards are the lazy answer; use them only where they are genuinely the best affordance, and never nest them.

### 3.4 Motion

- Scroll-triggered reveals (short fade + small translate), tasteful, not on every element.
- Ease-out with exponential curves (ease-out-quart/expo). No bounce, no elastic, no parallax gimmicks.
- Do not animate layout properties. Respect `prefers-reduced-motion`.

### 3.5 Imagery

- Unify all photos with a subtle **navy duotone / tint** so mixed phone photos read as one set.
- Consistent aspect ratios (e.g. 3:2 for landscape features, 4:5 for portraits). Defined frames, not full-bleed mush behind text.
- People are the warmth. Let the group and course photos carry the human feeling so the rest of the design can stay disciplined.

### 3.6 Signature element

Pick **one** memorable thing and keep everything else quiet around it. Default choice: a **tri-service hairline** — three fine rules (navy / gold / ensign red, or three weights of the same) used at key transitions and beneath the wordmark. It encodes the Army–Navy–Air Force identity honestly, and becomes the thing the site is remembered by. Give the crest ceremonial space; do not shrink it into a favicon-sized afterthought or stretch the PNG.

---

## 4. Anti-patterns — do not ship any of these

- No giant one-word-in-gold headings.
- No default "elegant" contrast-serif display face.
- No dark/cream alternating bands as the only structure.
- No circle-check 2×2 feature grid.
- No emoji as UI icons (event meta included).
- No identical floating rounded cards; no nested cards; no side-stripe (thick coloured `border-left`) accents.
- No gradient text (`background-clip: text`), no default glassmorphism, no hero-metric template.
- No everything-centred stacks.
- No `#000` / `#fff`.
- No em dashes in generated microcopy (use commas, colons, or parentheses). Preserve the club's approved taglines verbatim.
- No bounce/elastic motion; no animating layout props.

---

## 5. Pages and layout direction (Version 1)

Version 1 pages: **Home, About, Events (+ admin), Membership enquiry, Veteran Resources, Contact.** A light **Gallery** is now worth including because event photos exist (see §8). Everything else (Square payments, merch, sponsor tiers with pricing, Wall of Honour) is **Phase 2 — out of scope here.**

### Home
The client felt the earlier concept was "a bit busy." Restraint is the assignment. Clean hero, then short teasers linking out. Detail lives on inner pages.

Hero direction (asymmetric, not centred-text-over-dark-photo):

```
┌──────────────────────────────────────────────┐
│  [crest]   wordmark            nav ....  [CTA] │
├──────────────────────────────────────────────┤
│                                                │
│  DISPLAY HEADLINE, LEFT       ┌──────────────┐ │
│  set big and confident        │  duotone     │ │
│  ─ tri-service hairline ─     │  group photo │ │
│  one-line supporting copy     │  in a frame  │ │
│                               └──────────────┘ │
│  [ Join the Club ]  next event ▸ compact strip │
└──────────────────────────────────────────────┘
```

One primary action (Join the Club). Show the single next upcoming event as a compact inline strip, not a stack of cards. Below the hero: short teasers (About, Events, Resources) that link out. Nothing stacked to the point of busyness.

### About
The club story, mission, the 2026 "getting started" phase, the 2027 vision (membership, a series across the three regions, an end-of-year championship), and the values. Editorial layout: real headings, generous measure, the tri-service motif. Present values as a considered typographic block, **not** the circle-check grid.

### Events (+ admin)
This must scale to ~25 events/year across three regions plus a championship, and be self-managed by non-technical volunteers via a password-protected admin form backed by Supabase (fields: region, title, date, venue, fees, status).

- Render events as an **editorial list / timeline**, not identical floating cards. Dates are a genuine sequence, so date markers are justified here.
- Distinguish **upcoming vs past automatically by date.** Past events can show a short recap and link to gallery photos.
- Filterable by region (Sunshine Coast / Gold Coast / Brisbane) and status.
- Primary action is the club's own registration form (captures details to the club; Square is Phase 2). Offer Facebook as a secondary option (see §6 for the URL). Do not fake a payment flow.

### Membership enquiry
$50/year, includes a hat or t-shirt. V1 is an enquiry/join **form** (paid membership via Square is Phase 2). Draft fields (single source, easy to edit, pending client confirmation): name, email, phone, service branch, playing/handicap info, hat or shirt choice + size, pickup/delivery preference. Keep the form calm and legible; clear labels, visible focus states, real validation and error copy in the interface's own voice.

### Veteran Resources
A short, dignified description plus the official link for each of: **Open Arms, Department of Veterans' Affairs (DVA), RSL Queensland, Soldier On, Golf Australia.** These are external, so open in a new tab with proper `rel`. This page carries duty-of-care weight; keep it clean and unhurried.

### Contact
Email, contact form, Facebook Messenger, and "South East Queensland" as the region. **No phone in V1.**
**Privacy, non-negotiable:** never publish the club's registered address (it is a private home). Region only. No map, no street address anywhere on the site.

### Gallery (light, recommended now)
A simple, well-cropped grid of duotone-unified event photos, sourced from the manifest in §8. Keep it minimal. Committee and sponsor-logo walls stay optional / Phase 2 until there is real content; do not invent placeholder people or fake sponsor logos. A single "Support the club / Become a sponsor" call to action is fine.

---

## 6. Content, links and facts

Use SEQDVGC's own approved content. Do not lift the reference club's wording.

- **Region:** South East Queensland (Brisbane, Sunshine Coast, Gold Coast).
- **Taglines (verbatim, brand assets):** "Together we play. Together we grow." · "United by service. Connected by golf." · "For veterans. By veterans. For the community."
- **Values:** the canonical set is **not yet decided** by the client. Keep values in a single editable data source and use a clear placeholder set (Mateship, Connection, Wellbeing, Respect) marked `TODO: confirm with client`. Do not hardcode values into markup in five places.
- **2026 events:**
  - **Gold Coast Open Day** — Friday 31 July 2026, Palmer Gold Coast Golf Course, Robina QLD. Meet 8:30am, first tee 9:04am, 18 holes, green fees $115 (shared cart), side comp $10 (handicap only). Sponsor: Palmer Gold Coast. **Note:** this date has now passed, so it should render as a *past* event with a recap and gallery link, not as "upcoming."
  - **Event 2** — `TODO: details from client.`
- **Facebook (wire this everywhere Facebook or Messenger appears — header/footer social, contact page, event RSVP secondary action):**
  `https://www.facebook.com/people/South-East-Queensland-Defence-Veterans-Golf-Club/61589746402971/`
- **Email:** seqdvgc@gmail.com
- **Logo:** use `SEQDVGC-logo-transparent.png` for now; give it space, never stretch it. `TODO: request original vector/SVG from the designer` and swap when available.
- **Fix the carried-over typo:** any "SEQDV**CC**" must read "SEQDV**GC**".

Copy voice: plain, active, sentence case. Buttons say exactly what happens ("Join the club", not "Submit"). Errors explain what to fix without apologising. Every word earns its place.

---

## 7. How to work (do this before building the full site)

Follow the two-pass method from the frontend-design / impeccable approach:

1. **Plan.** Produce a compact token system (colour as named hex, type roles, layout concept, the one signature element) and a one-screen wireframe for the Home hero and the Events list. Keep it short.
2. **Critique the plan against the brief.** For each choice ask: "would a generator produce this for any veterans golf club?" If yes, revise and say what changed and why. Specifically re-check the palette-plus-type combination against the navy/gold/serif reflex.
3. **Show me the plan.** Do not build all six pages before I have seen the direction. Build the Home page first as the reference implementation, then I confirm, then you roll the system across the rest.
4. **Build**, deriving everything from the tokens. Watch Tailwind/CSS specificity so section and element selectors do not cancel each other's spacing.
5. **Self-critique.** Screenshot as you go if the environment allows. Remove one thing that does not earn its place before calling a page done.

If the `impeccable` or `frontend-design` skill is available in this environment, invoke it and set up `PRODUCT.md` / `DESIGN.md` from this brief rather than working from memory.

---

## 8. Assets and event photos (technical convention)

Real event photos are being added (from the 31 July Gold Coast Open Day). Handle them like this:

- **Location:** `public/images/events/<event-slug>/` (e.g. `public/images/events/gold-coast-open-2026/`).
- **Filenames:** descriptive kebab-case (`gc-open-2026-group-tee.jpg`), never `IMG_4821.jpg`.
- **Manifest:** each event folder gets a `captions.json` listing every file with a title, alt text, orientation, an intended `role`, whether faces are identifiable, and a consent flag. **Read it and place photos by `role`; never guess.** The real manifest for the Gold Coast Open Day is supplied alongside this brief. Schema:

```json
[
  {
    "file": "gc-open-2026-group-banner.jpg",
    "title": "Members group photo (with club banner)",
    "alt": "SEQDVGC members gathered at the tee beside the club banner, Gold Coast Open Day",
    "orientation": "landscape",
    "role": "hero-candidate",
    "faces": "yes",
    "consent": "pending",
    "notes": ""
  }
]
```

`faces` is `"yes" | "partial" | "no"`. `role` is one of `hero-candidate`, `feature`, `gallery`, `accent`.

- **Optimise before committing:** resize to ~1600–2000px longest edge, compress to roughly 200–500KB, prefer WebP or well-compressed JPG. Large unoptimised phone photos wreck the performance score, which matters for a portfolio piece. You may script this (sharp/squoosh).
- **Strip EXIF/GPS metadata** on every photo before it ships (phone images embed location and time). Privacy and polish.
- **Consent:** only publish identifiable faces the club has cleared for publication. Where `faces` is `"yes"` or `"partial"` and consent is `"pending"`, prefer wide or from-behind shots until cleared. `TODO: confirm photo consent with the club.`
- **Screenshots are not source files.** Some photos may arrive as screenshots of the Facebook photo viewer (visible close/zoom/arrow chrome) or as video frames with a baked-in shot-tracer overlay. Do not ship these. Use the original full-resolution files from the Facebook album; if only a screenshot exists, flag it in `notes` and crop out all UI, and never use an overlay-baked frame as a hero.
- Apply the navy duotone treatment (§3.5) so the mixed set reads as one.

### Where the photos go

Place images by their manifest `role`:

- **Home hero frame:** a `hero-candidate` (a strong wide landscape, or the group shot for human warmth). One image only, duotone, in the defined hero frame from §5. Not a muddy full-bleed behind text.
- **About "who we are":** the group photo (`role: hero-candidate` / group), in a clean frame beside the story.
- **Events, Gold Coast Open Day (now a *past* event):** a small recap with two or three photos, and a link through to the full album on Facebook (§6).
- **Gallery:** the full set, cropped to consistent ratios, duotone-unified, `gallery` and `accent` roles included.
- The **Gallery and every event recap link to the club's Facebook page** (URL in §6) so members can see the complete album. Set `target="_blank"` with `rel="noopener noreferrer"`.

Alt text comes straight from the manifest. Do not invent alt text or leave it empty.

---

## 9. Quality floor (definition of done)

- Responsive to mobile; layout holds at 360px width.
- Visible keyboard focus on every interactive element; logical tab order.
- WCAG AA contrast throughout, AAA on body text where feasible.
- `prefers-reduced-motion` respected.
- Real, tuned UX copy on forms, errors and empty states (no lorem, no filler).
- No item from the §4 anti-pattern list present.
- Fonts loaded efficiently (self-hosted or preconnected); no layout shift on load.
- All Facebook/Messenger references point at the URL in §6; no private address anywhere.
- Runs clean on Vercel; events read from Supabase; admin is password-protected.

---

## 10. Explicitly out of scope (Phase 2)

Square payments (membership / comps / donations), merch store, sponsor packages with pricing, Wall of Honour, Committee page. Do not build these now. If a natural hook helps later (e.g. a "Support the club" CTA), leave it as a simple link, not a half-built feature.
