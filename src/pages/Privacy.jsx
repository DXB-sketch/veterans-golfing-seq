import RibbonRule from "../components/RibbonRule.jsx";
import { CLUB_ABN, CLUB_EMAIL } from "../lib/site.js";

{/* Finalised with the club 2026-08 — template wording, not legal advice; have the club's adviser review before/at launch. */}

const sections = [
  {
    heading: "Information we collect",
    body: "When you join the Club we collect the details you provide: your name, email, phone (optional), service branch, whether you hold a GA handicap, and your Golf Links number (optional). If you accept a member login invite, we hold your email and sign-in credentials with our secure authentication provider. When you book a tee slot for an event we collect your name, mobile number (optional, for reminders), handicap and Golf Links details, and your side comp and cart hire preferences. When you use our contact or volunteer forms we collect your name, email, phone (optional) and message. If you make a payment, we record the amount, purpose and payer details you supply; your card details are entered directly with our payment provider and are never collected or stored by us. Photos taken at Club events may include your image — see our Terms for how to opt out.",
  },
  {
    heading: "How we use it",
    body: "We use your information to respond to your enquiries, manage membership, organise and run events, and provide the services you request.",
  },
  {
    heading: "Who we share it with",
    body: "We use Square to process payments and Supabase to securely store form submissions and event data. These providers handle information under their own terms and privacy policies. We do not sell your personal information, and we only disclose it where necessary to run the Club or where required by law.",
  },
  {
    heading: "Storage and security",
    body: "We take reasonable steps to protect your information from misuse, loss and unauthorised access, and we keep it only as long as we need it.",
  },
  {
    heading: "Access and correction",
    body: `You can ask to access, correct or delete the personal information we hold about you by emailing ${CLUB_EMAIL}.`,
  },
  {
    heading: "Cookies and analytics",
    body: "This site uses only the cookies needed for it to function. We do not run analytics or advertising trackers. If that ever changes, this policy will be updated to describe them.",
  },
  {
    heading: "Children",
    body: "This website is intended for adults arranging membership and events. Family members are welcome at the Club, but accounts and payments are managed by adults.",
  },
  {
    heading: "Changes",
    body: "We may update this policy from time to time. Any changes will be posted here with a new “last updated” date.",
  },
  {
    heading: "Contact",
    body: `Questions about your privacy? Email us at ${CLUB_EMAIL}.`,
  },
];

export default function Privacy() {
  return (
    <>
      <section className="bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            How we handle your information
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Privacy policy
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-6 text-sm font-semibold text-cream/80">
            Last updated: 4 August 2026
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="max-w-[68ch] text-lg text-ink">
            South East Queensland Defence Veterans Golf Club Inc. (ABN{" "}
            {CLUB_ABN}) (&ldquo;the Club&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;)
            respects your privacy. This policy explains how we handle personal
            information, in line with the Australian Privacy Principles under
            the Privacy Act 1988 (Cth).
          </p>
          <div className="mt-10 space-y-8">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-display text-xl font-semibold tracking-wide text-navy">
                  {s.heading}
                </h2>
                <p className="mt-2 max-w-[68ch] text-ink-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
