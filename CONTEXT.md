SEQDVGC Website Build — Project Context & Handoff
Purpose: Full context for continuing the South East Queensland Defence Veterans Golf Club website build in a new chat. Everything decided so far, what's still open, and the next actions.

1. Snapshot
Project: Custom website for South East Queensland Defence Veterans Golf Club Inc. (SEQDVGC), a registered Australian non-profit veterans' golf community.
Developer: Dexter, solo developer building with Claude Code (React/JSX, Tailwind, Vercel deploys). This is his first paid external client.
Approach: Custom build (deliberately chosen over Wix/Squarespace so Dexter works in his fluent stack, not a builder tool).
Status: Requirements largely gathered. Awaiting a few client answers + a funding-source reply before the final quote. Build not yet started.
Deliverable so far: transparent PNG of the club logo produced (SEQDVGC-logo-transparent.png).
2. Client & relationship
Client is a family friend, referred via Dexter's mother. Runs the club.
Preferred contact: seqdvgc@gmail.com or Facebook Messenger. No phone currently.
Facebook: "South East Queensland Defence Veterans Golf Club" (page exists; not machine-fetchable — pull content manually).
Low-budget non-profit. Pays cash. Getting a mates-and-non-profit discount.
Tone with client: warm, informal, professional. Lead with value, never haggle.
3. About the club (approved content)
Sourced near-verbatim from the club's own "Who We Are" material:

Australian defence veteran community golf group supporting veterans and their families.
Promotes connection, mental and physical wellbeing within the veteran community through golf.
Registered non-profit incorporated association. Reaching out for sponsors, government grants and donations. All funds go to supporting Australian veteran members and the events run for them.
Veteran golfers of all abilities welcome; all veterans (serving and non-serving) and family members.
2026 — getting started: running golf events in Brisbane, Sunshine Coast, Gold Coast; testing the waters; building community.
2027 — the vision: open membership options (members compete and secure spots for an end-of-year championship); a series of rounds through the year across the three regions; build a strong, connected defence veteran golf community.
Taglines: "Together we play. Together we grow." · "United by service. Connected by golf." · "For veterans. By veterans. For the community."
Tri-service identity: Army, Navy, Air Force.
⚠️ Values need alignment (open item). The materials are inconsistent:

Posters/flag: Mateship, Connection, Wellbeing + Honour, Service, Respect.
Earlier web concept: Mateship, Inclusion, Wellbeing, Respect, Community.
→ Ask the client to pick one canonical set before building.
4. Brand & design
Palette: navy + gold primary, with red and white accents (light blue appears in the crest). Client confirmed they like it.
Logo: military crest (tri-service emblem, laurels, crossed golf clubs, "SOUTH EAST QUEENSLAND / DEFENCE VETERANS / GOLF CLUB INC."). A transparent PNG has been generated from the client's white-background file. For best quality at all sizes, request the original vector/SVG from whoever designed it.
Existing marketing materials (AI-generated): logo, two "Who We Are" infographics, a Gold Coast Open Day event flyer, a feather/teardrop flag banner. Good source for copy, tone, and layout cues.
Homepage note: client felt the first concept was "a bit busy." Fix: clean, simple hero (logo, tagline, one upcoming-event card + a "Join the Club" button), then short teasers linking to inner pages. Detail lives on inner pages, not stacked on the front.
Typo to fix: one concept heading read "SEQDVCC" — should be "SEQDVGC".
5. Site structure
Version 1 (first invoice):

Home
About (story, mission, 2026–27 vision, values)
Events (with self-service admin — see §9)
Membership enquiry (form)
Veteran Resources
Contact
Phase 2 (priced separately, built when needed):

Square payments across membership / comp fees / donations
Merch store
Sponsor packages (Platinum / Gold / Community — costs & benefits TBC from client)
Wall of Honour (veteran stories, club history, memorial events — client to supply/write)
Veteran Resources page: short description + official link for each of Open Arms, Department of Veterans' Affairs (DVA), RSL Queensland, Soldier On, Golf Australia. Dexter to write these (client confirmed the list).

6. Events
2026: only two events.
Event 1 — Gold Coast Open Day: Fri 31 July 2026, Palmer Gold Coast Golf Course, Ron Penhaligon Way, Robina QLD. Meet 8:30am, first tee 9:04am, 18 holes, green fees $115 (shared cart), side comp $10 (handicap only). All veterans + family welcome. Event sponsor: Palmer Gold Coast.
Event 2: details TBC from client.
2027: ~8 events per region × 3 regions (Sunshine Coast, Gold Coast, Brisbane) + a 2–3 day championship ≈ 25 events/year.
→ Events system must scale and be self-managed by non-technical volunteers, filterable by region and status.
7. Membership
$50/year, includes a hat or t-shirt.
Join form fields (draft — confirm with client): name, email, phone, service branch, playing/handicap info, hat/shirt choice + size, pickup/delivery preference.
V1 = enquiry/join form; paid membership via Square is Phase 2.
8. Payments — Square (decided)
Provider: Square. Client already uses it; good fit because the club runs in-person events (tap-to-pay / Square POS at the course for green fees, comps, merch) and needs online payments — one dashboard, one reconciliation.
Uses: membership fees, event/comp entry fees, donations, merchandise.
Implementation (custom site): embed Square payment links/buttons for membership, comps, donations; use the free Square Online store for merch (link/embed).
Critical: the Square account + linked bank account must be in the club's name, not Dexter's. Requires the club's ABN / incorporation (they have it).
Never build custom payment processing (PCI/security/liability). Square only.
Data pattern: a form captures the info, Square handles the money.
9. Tech stack & architecture (custom build)
Front-end: custom build in Dexter's stack (React/JSX, Tailwind), deployed on Vercel.
Event self-management (decided): Supabase (Postgres) + a small password-protected custom admin page. Volunteers add/edit/delete events via a simple form (fields: region, title, date, venue, fees, status); the site reads from the DB. Keeps everything in one owned stack; scales to the 25-events/year, 3-region + championship structure. (Alternatives considered and set aside: Sanity/Contentful headless CMS; Airtable-as-backend.)
Same DB pattern can later cover members if desired.
10. Domain, hosting, contact
Domain: seqdvgc.org.au (eligible now they're a registered association). Register it in the CLUB's name/account, not Dexter's — have the club create the registrar account so ownership is unambiguous and Dexter never holds it hostage or owns their renewals. Use an Australian registrar (e.g. VentraIP) for .au eligibility. Point DNS at Vercel.
Hosting: Vercel (free tier fine for a small club site; ~$20/mo only if it scales; ideally on the club's own account long-term).
Division of control to set with client: club owns the domain and self-manages events; design/structural/code changes go through Dexter (the real trade-off of custom vs a builder — everyone should know it up front).
Contact on site: email + contact form + Facebook Messenger + "South East Queensland" as the region. No phone for V1 (optional later).
⚠️ Privacy: the registered NFP address (7 Winnett Street, Woorim) is the client's personal home — do NOT publish it on the site. Keep it to incorporation paperwork only. Use a PO Box later if a mailing address is ever needed.
11. Commercial / pricing
Market rate for this scope (custom multi-page + event CMS + Square + membership + merch + sponsors), AU freelancer/agency: ~$3,000–6,000 (use as the stated anchor).
Mates-and-non-profit phased rate:
Version 1 (Home, About, Events + admin, Membership enquiry, Resources, Contact): ~$800–1,200.
Phase 2 (Square payments, merch store, sponsor packages, Wall of Honour): ~$600–1,000.
Total ~$1,500–2,200, phased. (Consistent with ~$1,250 valuation on Dexter's other sites; this one is bigger.)
First paid external client → the case study + referrals into the veteran/community world are worth a lot; okay to lean to the lower end of V1 to lock the yes, but don't undervalue a multi-day build.
Protections: 50% deposit before starting; put total + scope + inclusions in writing (even a text); later additions = friendly paid extras, not absorbed scope creep.
Before final quote: learn the funding source (grant/sponsor money vs club funds) — asked via text; shapes how hard to lean on the discount. Do not ask "what's your budget" directly.
Client pays cash.
12. Outstanding items & next actions
Waiting on the client:

Funding source (grant/sponsor vs club funds). - No longer waiting, it's club funds.
Second 2026 event details.
Values wording — pick the canonical set.
Sponsor tier costs & benefits (Platinum/Gold/Community) — Phase 2.
Confirm they're happy: domain in club's name, events self-managed, code changes via Dexter, hosting on Vercel.
Photos from the 31 July event (client is capturing these).
Dexter to do:

Send the phased quote once funding answer is in.
Draft the membership form fields for approval.
Turn the "Who We Are" material into web copy.
Write Veteran Resources descriptions + official links.
Register domain (in club's name) + set up Supabase + build V1.
Request the vector/SVG logo from the designer.
Fix the "SEQDVCC" typo in any carried-over assets.
13. About the developer (for continuity)
Dexter — IT student, Brisbane / Bribie Island area, QLD, Australia. Builds full-stack apps fast with Claude Code.
Building a custom web-dev / software business; strategy is to use client work as an on-ramp toward a productized/vertical product later.
Other work / proof: Bribie Island Tigers FC Training Hub (his father is the club president), Courageous Girls Club Leaders app (his mother's business), an electrical-company website lead. Building a personal-name portfolio site on Vercel.
SEQDVGC is the first unrelated, paying client — the key proof point for the business.

