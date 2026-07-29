# Claude Code prompt — SEQDVGC "everything buildable now" (legal pages, Phase 2 page shells, payment scaffolding)

Paste everything below into a fresh Claude Code chat in the `veterans-golfing-seq` repo.

---

You are working in the existing SEQDVGC website repo (Vite + React + Tailwind + react-router, deployed on Vercel; events/forms already wired to Supabase). This task ADDS new pages, data files, and inert payment scaffolding. It must NOT rebuild or restyle anything that already exists.

## Ground rules (read first)
1. **Read `DESIGN.md` before writing any UI.** Reuse the existing primitives — `Section`, `RibbonRule`, `Button`, `FormField`, `TeaserCard`, `Nav`, `Footer` — and the existing design tokens (navy / gold / cream, the ribbon rule, uppercase display headings). New pages must look like they were always part of the site. Match the structure of existing pages like `src/pages/Resources.jsx` and `src/pages/Contact.jsx`.
2. **Don't invent facts.** No made-up prices, sponsor names, testimonials, dates, or veteran stories. Where real content isn't available yet, use empty arrays / `null` and a clearly commented `// TODO:` so it's obvious what the club still needs to supply. Pages must render gracefully (a tasteful empty state) when their data is empty.
3. **Honour the existing do-not list:** no phone number anywhere, never print a street address, only render *confirmed* sponsors, no custom card handling beyond the Square SDK described below.
4. **Payment code must be completely inert and safe until credentials exist.** If the Square env vars are absent, payment components render a quiet "Online payments coming soon" state and make zero network calls. The site must build and run fine with no Square keys set.
5. When you finish, run `npm run build` and fix anything that breaks. Do not commit any secrets. Update `.env.example` (names only).

---

## PART A — Legal pages (Privacy Policy + Terms of Use)

Create `src/pages/Privacy.jsx` and `src/pages/Terms.jsx` using the existing `Section` / `RibbonRule` layout pattern (a navy header band like the other inner pages, then cream body with headings). Put an "Last updated: [DATE]" line at the top of each. Keep the copy in the page components. Add a prominent HTML comment at the top of each file: `{/* REVIEW BEFORE PUBLISHING — starting template, not legal advice. Fill every [BRACKETED] placeholder and have the club confirm the refund + liability sections. */}`

Use this copy verbatim, keeping the `[BRACKETS]` as visible placeholders:

### Privacy Policy copy
> **Privacy Policy**
> Last updated: [DATE]
>
> South East Queensland Defence Veterans Golf Club Inc. [ABN: ______] ("the Club", "we", "us") respects your privacy. This policy explains how we handle personal information, in line with the Australian Privacy Principles under the Privacy Act 1988 (Cth).
>
> **Information we collect.** When you use our membership enquiry form we collect the details you provide: your name, email, phone (optional), service branch, playing/handicap information, apparel choice and size, and delivery preference. When you use our contact form we collect your name, email and message. If you make a payment, your card details are entered directly with our payment provider and are never collected or stored by us.
>
> **How we use it.** We use your information to respond to your enquiries, manage membership, organise and run events, and provide the merchandise or services you request.
>
> **Who we share it with.** We use Square to process payments and Supabase to securely store form submissions and event data. These providers handle information under their own terms and privacy policies. We do not sell your personal information, and we only disclose it where necessary to run the Club or where required by law.
>
> **Storage and security.** We take reasonable steps to protect your information from misuse, loss and unauthorised access, and we keep it only as long as we need it.
>
> **Access and correction.** You can ask to access, correct or delete the personal information we hold about you by emailing [seqdvgc@gmail.com].
>
> **Cookies and analytics.** This site uses only the cookies needed for it to function. [If website analytics are added later, update this section to describe them.]
>
> **Children.** This website is intended for adults arranging membership and events. Family members are welcome at the Club, but accounts and payments are managed by adults.
>
> **Changes.** We may update this policy from time to time. Any changes will be posted here with a new "last updated" date.
>
> **Contact.** Questions about your privacy? Email us at [seqdvgc@gmail.com].

### Terms of Use copy
> **Terms of Use**
> Last updated: [DATE]
>
> This website is operated by South East Queensland Defence Veterans Golf Club Inc. [ABN: ______]. By using this site you agree to these terms.
>
> **Membership.** Membership is $50 per year and includes a club hat or t-shirt. Membership is confirmed once your enquiry is accepted and payment is received. [Add renewal terms — e.g. whether membership auto-renews or is re-purchased each year.]
>
> **Events.** Participation in Club golf days and events is at your own risk. You are responsible for your own conduct, health and fitness to play. Event details, venues and fees may change, and we will let you know if they do. [Add any waiver or eligibility terms the Club requires.]
>
> **Payments.** Payments are processed securely by Square. By paying you authorise the charge shown. All prices are in Australian dollars. [State whether prices include GST, if the Club is GST-registered.]
>
> **Refunds and cancellations.** [Set the Club's policy here — e.g. whether event fees are refundable and up to what date. Faulty or misdescribed merchandise is covered by your rights under the Australian Consumer Law, which these terms do not exclude.]
>
> **Merchandise.** Orders are fulfilled by pickup at events or by post, as selected at checkout. [Confirm when risk/ownership passes and any postage terms.]
>
> **Intellectual property.** The Club's name, crest, logo and website content belong to the Club and may not be reused without permission.
>
> **External links.** We are not responsible for the content of third-party websites we link to.
>
> **Liability.** To the maximum extent permitted by law, the Club is not liable for any loss arising from use of this website or participation in events. Nothing in these terms excludes rights you have under the Australian Consumer Law.
>
> **Governing law.** These terms are governed by the laws of Queensland, Australia.
>
> **Contact.** Questions? Email [seqdvgc@gmail.com].

Then:
- Add routes `/privacy` and `/terms` in `src/App.jsx`.
- In `src/components/Footer.jsx`, add a small legal row linking "Privacy Policy" and "Terms of Use".
- Under the submit button on BOTH the existing `src/pages/Membership.jsx` and `src/pages/Contact.jsx` forms, add one small line of muted text: "By submitting, you agree to our Privacy Policy." with "Privacy Policy" linking to `/privacy`. This is the only change permitted to those existing files — do not touch their logic or layout otherwise.

---

## PART B — Sponsors page (content shell, data-driven)

Create `src/data/sponsors.js`:
```js
// Sponsor tiers. Prices/benefits TODO — confirm with the club before publishing.
export const tiers = [
  { name: "Platinum",  price: null, benefits: [] },   // TODO: price + benefits
  { name: "Gold",      price: null, benefits: [] },   // TODO
  { name: "Community", price: null, benefits: [] },   // TODO
];
// Only CONFIRMED sponsors go here — never placeholders. Each: { name, logo, url, tier }
export const confirmedSponsors = []; // TODO: add confirmed sponsors + logos
```
Create `src/pages/Sponsors.jsx`: a navy header band + intro explaining the Club seeks sponsors and grants to support veterans; render the three tier cards (show "Price TBC" when `price` is null, and hide the benefits list when empty); render a confirmed-sponsors logo grid ONLY when `confirmedSponsors` is non-empty, otherwise omit that section entirely; finish with a "Become a sponsor" call to action that is a `mailto:seqdvgc@gmail.com` link for now. Add route `/sponsors` and a Footer link.

---

## PART C — Wall of Honour page (content shell, data-driven)

Create `src/data/honour.js`:
```js
// Wall of Honour entries. Empty for now — the club will supply content + photos,
// and must have consent to publish each named person/photo before it goes live.
// Shape: { name, service, years, photo, story, consentOnFile }
export const honourEntries = [];
// Example (commented, do not render):
// { name: "", service: "Army", years: "", photo: "", story: "", consentOnFile: false }
```
Create `src/pages/WallOfHonour.jsx`: a respectful navy header band + short intro about honouring the service and stories of the veteran community; render entries when present (name, service/years, a photo slot that shows a tasteful placeholder block when `photo` is empty, and the story text); when `honourEntries` is empty, show a dignified empty state ("Stories coming soon — we're gathering them with care."). Add route `/wall-of-honour` and a Footer link. Add a comment noting this can later migrate to a Supabase table + admin page for self-management, but a data file is fine for now.

---

## PART D — Merch page (shell, links to Square Online when ready)

Create `src/data/merch.js`:
```js
export const storeUrl = ""; // TODO: paste the club's Square Online store URL when live
// Optional preview items. Shape: { name, price, image, note }
export const products = []; // TODO: add products + photos, or rely on the Square store
```
Create `src/pages/Merch.jsx`: intro; if `storeUrl` is set, a primary Button linking out to it ("Shop the store"); render `products` as cards with photo-placeholder blocks when `image` is empty; when both `storeUrl` is empty and `products` is empty, show a "Merch coming soon" state. Add route `/merch` and links in Nav and Footer.

---

## PART E — Square in-page payment scaffolding (INERT until configured)

Goal: reusable in-page Square Web Payments SDK component + a serverless charge endpoint, wired to env vars, doing nothing until the club's Square credentials are added. Use for the fixed-amount flows only in this pass (membership + donations). Event-fee payment is intentionally NOT wired here — it's blocked on a club decision (whether green fees are paid to the club or to the course).

1. Install `react-square-web-payments-sdk`. For the backend, use the official `square` Node SDK (or a plain `fetch` to the Payments API) — your choice.
2. Add to `.env.example` (names only, no values):
   ```
   # Square — public (safe in the browser)
   VITE_SQUARE_APP_ID=
   VITE_SQUARE_LOCATION_ID=
   # Square — SERVER ONLY (never expose to the client)
   SQUARE_ACCESS_TOKEN=
   SQUARE_ENVIRONMENT=sandbox
   ```
   Confirm `.env` stays gitignored. The client bundle must only ever read the `VITE_` vars; `SQUARE_ACCESS_TOKEN` must never appear in client code.
3. Create `src/components/SquarePayment.jsx`:
   - Props: `itemType` ("membership" | "donation"), optional `amount` (for donations), `onSuccess`.
   - If `import.meta.env.VITE_SQUARE_APP_ID` or `VITE_SQUARE_LOCATION_ID` is missing → render a quiet styled notice "Online payments coming soon" and nothing else (no SDK load, no network).
   - Otherwise render `<PaymentForm>` from `react-square-web-payments-sdk` with the app/location IDs, showing the Card form plus Apple Pay and Google Pay buttons. On tokenize, POST `{ token, itemType, amount }` to `/api/create-payment`, then call `onSuccess` on a successful response. Handle errors with a friendly message (match the tone of the existing form error states).
4. Create a Vercel serverless function `api/create-payment.js` (repo-root `/api`, Node runtime):
   - Read `SQUARE_ACCESS_TOKEN` and `SQUARE_ENVIRONMENT` from `process.env`; pick the sandbox vs production Payments API base accordingly.
   - **Decide the amount on the server, never trust the client for fixed items:** membership = 5000 cents (AUD $50). For donations, read the client amount but validate it is an integer within a sane range (e.g. $2–$7000) and reject otherwise.
   - Generate a unique idempotency key per charge. Call the Square Payments API with the token, amount, currency `AUD`, and a note/reference for `itemType`. Return `{ ok: true, paymentId }` or `{ ok: false, error }` with an appropriate status.
   - If `SQUARE_ACCESS_TOKEN` is unset, return a clear 503 "payments not configured" (so nothing 500s in preview).
   - Ensure the SPA rewrite in `vercel.json` does NOT capture `/api/*` (exclude the api path from the catch-all rewrite to index.html).
5. **Content-Security-Policy for the SDK.** Square's Web Payments SDK requires a secure context and a CSP that allows its domains. Add a starter CSP via `vercel.json` `headers` allowing (at minimum) `https://*.squarecdn.com`, `https://sandbox.web.squarecdn.com`, `https://web.squarecdn.com`, `https://connect.squareup.com`, `https://connect.squareupsandbox.com`, `https://*.squareup.com`, plus Google Pay / Apple Pay domains, in `script-src`, `frame-src`/`child-src`, `connect-src`, and `img-src` as appropriate. Leave a comment noting these should be verified against Square's current "Web Payments SDK CSP" requirements and tightened before launch.
6. Wire the inert usages:
   - On `src/pages/Membership.jsx`: after a successful enquiry submission (the existing success state), also render `<SquarePayment itemType="membership" />`. Since env is unset for now, this shows "coming soon" — that's expected. Do not otherwise change the form logic.
   - Create a small Donate section: either a `src/pages/Donate.jsx` (route `/donate`, Footer link) or a section on the Sponsors page — your call, keep it simple. It lets the visitor choose/enter an amount and renders `<SquarePayment itemType="donation" amount={...} />`. Include a placeholder line: "[Confirm with the club whether donations are tax-deductible (DGR status) before adding any tax-deductibility wording.]"

---

## PART F — Wiring & verification
- Add all new routes to `src/App.jsx`. Keep the main `Nav` uncluttered — it's fine to add Merch to the main nav, but Sponsors, Wall of Honour, Donate, Privacy and Terms can live in the `Footer`. Group the footer links sensibly (e.g. a "More" column and a "Legal" row).
- Do not modify existing page logic beyond the two small permitted additions (the privacy line under the Membership and Contact forms, and the inert membership payment block).
- Run `npm run build`; fix any errors. Report what you created, which env vars must be set later in Vercel, and a short list of every `// TODO` placeholder you left for the club to fill.
