import RibbonRule from "../components/RibbonRule.jsx";
import { CLUB_ABN, CLUB_EMAIL } from "../lib/site.js";

{/* REVIEW BEFORE PUBLISHING — starting template, not legal advice. Fill every [BRACKETED] placeholder and have the club confirm the refund + liability sections. */}

const sections = [
  {
    heading: "Membership",
    body: "Membership is $50 per year and includes a club hat. Membership is confirmed once your enquiry is accepted and payment is received. [Add renewal terms — e.g. whether membership auto-renews or is re-purchased each year.]",
  },
  {
    heading: "Events",
    body: "Participation in Club golf days and events is at your own risk. You are responsible for your own conduct, health and fitness to play. Event details, venues and fees may change, and we will let you know if they do. [Add any waiver or eligibility terms the Club requires.]",
  },
  {
    heading: "Payments",
    body: "Payments are processed securely by Square. By paying you authorise the charge shown. All prices are in Australian dollars. [State whether prices include GST, if the Club is GST-registered.]",
  },
  {
    heading: "Refunds and cancellations",
    body: "A booking for a Club event may be cancelled and the fees paid refunded in full, provided the Club receives the cancellation request no later than three (3) days prior to the scheduled date of the event. Cancellation requests received after that time, and failures to attend, will not be eligible for a refund, and any fees paid will be forfeited. Refund requests must be made by email to the Club and will be processed to the original payment method. If the Club cancels an event, all fees paid for that event will be refunded in full. Nothing in this policy excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law.",
  },
  {
    heading: "Intellectual property",
    body: "The Club's name, crest, logo and website content belong to the Club and may not be reused without permission.",
  },
  {
    heading: "External links",
    body: "We are not responsible for the content of third-party websites we link to.",
  },
  {
    heading: "Liability",
    body: "To the maximum extent permitted by law, the Club is not liable for any loss arising from use of this website or participation in events. Nothing in these terms excludes rights you have under the Australian Consumer Law.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of Queensland, Australia.",
  },
  {
    heading: "Contact",
    body: `Questions? Email ${CLUB_EMAIL}.`,
  },
];

export default function Terms() {
  return (
    <>
      <section className="bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            The rules of the fairway
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Terms of use
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
            This website is operated by South East Queensland Defence Veterans
            Golf Club Inc. (ABN {CLUB_ABN}). By using this site you agree to
            these terms.
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
