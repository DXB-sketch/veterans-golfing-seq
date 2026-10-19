import { Link } from "react-router-dom";
import RibbonRule from "../components/RibbonRule.jsx";
import { CLUB_ABN, CLUB_EMAIL } from "../lib/site.js";

// Written against the Australian Privacy Principles (Privacy Act 1988 (Cth),
// as amended to 2024) and the Spam Act 2003. Template wording, not legal
// advice: have the club's adviser review it. If a new form field, provider
// or tracker is added to the site, update the matching section and the
// LAST_UPDATED date.
const LAST_UPDATED = "19 October 2026";

const email = (
  <a
    href={`mailto:${CLUB_EMAIL}`}
    className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-2 hover:text-crimson"
  >
    {CLUB_EMAIL}
  </a>
);

const sections = [
  {
    id: "about",
    heading: "About this policy",
    body: [
      <>
        Small not-for-profit associations are not always required to follow
        every part of the Privacy Act, but we choose to handle personal
        information in line with the Australian Privacy Principles (APPs)
        because our members trust us with it. This policy covers this website
        and the information we collect through it, by email, through Facebook
        and at our events.
      </>,
    ],
  },
  {
    id: "collect",
    heading: "What we collect",
    body: [
      "We only collect what we need to run the Club. Depending on how you deal with us, that may include:",
    ],
    list: [
      <>
        <strong>Event bookings:</strong> your name, email address, home suburb
        and postcode, mobile number (optional), whether you hold a Golf
        Australia handicap, your Golf Links number (optional), your side comp
        and cart hire choices, whether you have paid or will pay at the
        course, and whether you&apos;d like emails about future events.
      </>,
      <>
        <strong>Membership:</strong> your name, email, phone (optional),
        service branch, handicap details and Golf Links number (optional),
        membership status and renewal date. If you accept a member login
        invitation we also hold your sign-in email and a securely hashed
        password (we never see your password).
      </>,
      <>
        <strong>Contact and volunteer forms:</strong> your name, email, phone
        (optional) and your message.
      </>,
      <>
        <strong>Payments, donations and sponsorships:</strong> the amount,
        what it was for, the payer&apos;s name and email, and company details
        for sponsors. Card details are entered directly into Square&apos;s
        secure payment form and are never seen or stored by us.
      </>,
      <>
        <strong>Photos:</strong> photos taken at Club events may include you.
        We only publish recognisable faces with consent, and will take a photo
        down on request.
      </>,
      <>
        <strong>Technical information:</strong> like any website, our hosting
        providers automatically log basic technical details (such as IP
        address, browser type and pages requested) to keep the site secure
        and working. We don&apos;t use these to identify you.
      </>,
    ],
  },
  {
    id: "sensitive",
    heading: "Sensitive information",
    body: [
      "We don't ask for health, medical or other sensitive information. Please don't include it in a form or message. If you choose to tell us something sensitive (for example, so we can make an event accessible for you), we will only use it for that purpose, with your consent.",
    ],
  },
  {
    id: "anonymity",
    heading: "Dealing with us anonymously",
    body: [
      "You can browse this site and ask general questions without telling us who you are. We do need your name and contact details to book you into an event, sign you up as a member or process a payment, because we can't provide those things anonymously.",
    ],
  },
  {
    id: "use",
    heading: "Why we collect it and how we use it",
    list: [
      "To book you into events, manage the tee sheet, and contact you about your booking (for example, a change of tee time, weather or venue).",
      "To manage memberships, renewals and member logins.",
      "To process payments, issue receipts and keep the financial records the law requires.",
      "To reply to enquiries and coordinate volunteers.",
      "Your suburb and postcode help us plan events across the regions our players travel from. We may report these in combined, de-identified form (for example, \"40% of players came from the Gold Coast\") to grant bodies and sponsors. We never share them in a way that identifies you.",
      "To meet our legal obligations, and to keep the site and our records secure.",
    ],
    after: [
      "We don't use your information for anything else without your consent, unless the law allows or requires it. We don't make decisions about you by automated means.",
    ],
  },
  {
    id: "marketing",
    heading: "Club emails",
    body: [
      <>
        We only send club news by email to members and to people who have
        ticked the box asking for it when booking. Every club email will tell
        you how to unsubscribe, and you can also just email us at {email} to
        stop them. Booking confirmations and messages about an event you&apos;re
        booked into aren&apos;t marketing, so you&apos;ll still receive those.
      </>,
    ],
  },
  {
    id: "share",
    heading: "Who we share it with",
    body: [
      "We do not sell, rent or trade personal information. We only share it where needed to run the Club:",
    ],
    list: [
      <>
        <strong>Public tee sheet:</strong> to help players see who
        they&apos;re playing with, event pages show the first initial and
        surname of each booked player next to their tee time (for example,
        &ldquo;J. Smith&rdquo;). No other booking details are public. If
        you&apos;d prefer not to be listed, email us and we&apos;ll show you
        as &ldquo;Guest&rdquo;.
      </>,
      <>
        <strong>Host golf courses:</strong> we may give the course hosting an
        event the names, tee times, handicap details and cart hire needs of
        players booked in, so they can run the day.
      </>,
      <>
        <strong>Our service providers</strong>, who store or process
        information for us under their own privacy and security commitments:
        Supabase (our database and member logins), Vercel (website hosting),
        Square (card payments), and Google (our club email account and the
        web fonts used on this site).
      </>,
      "Our committee members and volunteers, only as far as their role needs it, and bound to keep it confidential.",
      "Anyone the law requires us to share it with.",
    ],
  },
  {
    id: "overseas",
    heading: "Information stored overseas",
    body: [
      "Some of our service providers store or process information outside Australia. Our database is hosted in India; website hosting, email and font delivery may involve servers in the United States and other countries; and Square processes payments in Australia and the United States. We choose established providers that apply strong security (including encryption in transit and at rest) and take reasonable steps to make sure they handle your information consistently with the APPs.",
    ],
  },
  {
    id: "security",
    heading: "How we keep it safe",
    body: [
      "Your information is encrypted in transit and at rest with our providers. Access is limited to signed-in committee members, protected by database security rules, and members can only see their own records. Payment card details never touch our systems.",
      "If a data breach is likely to cause serious harm to anyone, we will notify the people affected and the Office of the Australian Information Commissioner (OAIC), in line with the Notifiable Data Breaches scheme.",
    ],
  },
  {
    id: "retention",
    heading: "How long we keep it",
    list: [
      "Event booking contact details (email, mobile, suburb, postcode and Golf Links number) are automatically deleted 12 months after the event. We keep the player's name and tee time as a record of who played.",
      "Payment and donation records are kept for 7 years, as required for financial and tax record-keeping.",
      "Membership records are kept while you're a member. The committee reviews lapsed memberships each year and deletes records that have been lapsed for more than 2 years.",
      "Contact and volunteer messages are kept only while they're needed. The committee reviews them each year and deletes those that have been dealt with.",
    ],
  },
  {
    id: "access",
    heading: "Accessing, correcting or deleting your information",
    body: [
      <>
        You can ask to see the information we hold about you, ask us to
        correct it, or ask us to delete it, by emailing {email}. Members can
        also update their details in the member area. There&apos;s no charge,
        and we&apos;ll respond within 30 days. If we can&apos;t do what you ask
        (for example, because the law requires us to keep a payment record),
        we&apos;ll explain why in writing.
      </>,
    ],
  },
  {
    id: "cookies",
    heading: "Cookies and tracking",
    body: [
      "This site does not use advertising or analytics cookies, tracking pixels or similar tools. On payment pages, Square's secure payment form uses its own cookies and device checks to prevent card fraud, under Square's privacy policy. If you sign in, your browser stores a sign-in token so you stay logged in. That storage is essential for the site to work and is removed when you sign out. If we ever add analytics, we will update this policy first.",
    ],
  },
  {
    id: "children",
    heading: "Children",
    body: [
      "Family members of all ages are welcome at Club events, but bookings, memberships and payments are made by adults. If someone under 18 is playing, a parent or guardian should book on their behalf.",
    ],
  },
  {
    id: "complaints",
    heading: "Questions and complaints",
    body: [
      <>
        If you have a question, or think we&apos;ve mishandled your
        information, please email {email}. We&apos;ll acknowledge your
        complaint within 7 days and aim to resolve it within 30 days. If
        you&apos;re not satisfied with our response, you can contact the
        Office of the Australian Information Commissioner at{" "}
        <a
          href="https://www.oaic.gov.au"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-2 hover:text-crimson"
        >
          oaic.gov.au
        </a>{" "}
        or on 1300 363 992.
      </>,
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: [
      "We may update this policy from time to time, for example when we add a new feature to the site. The current version will always be on this page with its \"last updated\" date.",
    ],
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
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="max-w-[68ch] text-lg text-ink">
            South East Queensland Defence Veterans Golf Club Inc. (ABN{" "}
            {CLUB_ABN}) (&ldquo;the Club&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) respects your privacy. This policy explains what
            personal information we collect, why, how we look after it, and
            your rights under the Australian Privacy Principles in the{" "}
            <em>Privacy Act 1988</em> (Cth).
          </p>

          <nav
            aria-label="On this page"
            className="mt-10 border-l-4 border-gold bg-paper p-6"
          >
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
              On this page
            </p>
            <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-[0.95rem] sm:grid-cols-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-navy underline decoration-gold/40 decoration-2 underline-offset-2 hover:decoration-gold"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="font-display text-xl font-semibold tracking-wide text-navy">
                  {s.heading}
                </h2>
                {s.body?.map((p, i) => (
                  <p key={i} className="mt-3 max-w-[68ch] text-ink-muted">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-3 max-w-[68ch] list-disc space-y-2 pl-5 text-ink-muted marker:text-gold">
                    {s.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.after?.map((p, i) => (
                  <p key={i} className="mt-3 max-w-[68ch] text-ink-muted">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <p className="mt-14 text-sm text-ink-muted">
            See also our{" "}
            <Link
              to="/terms"
              className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-2 hover:text-crimson"
            >
              Terms of Use
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
