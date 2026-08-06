import RibbonRule from "../components/RibbonRule.jsx";
import { CLUB_ABN, CLUB_EMAIL } from "../lib/site.js";

{/* Finalised with the club 2026-08 — template wording, not legal advice; have the club's adviser review before/at launch. */}

const sections = [
  {
    heading: "Membership",
    body: "Membership is $50 per year and includes a club hat. Membership commences on the date payment is received and remains current for twelve (12) months from that date. Membership does not renew automatically and no further payment will be charged without your action; to renew, simply pay the membership fee again online or with a committee member. Membership fees are not refundable except as required by law.",
  },
  {
    heading: "Events",
    body: "Club events are open to veterans, serving and ex-serving members of the Australian Defence Force, and their family members; the Club may ask you to confirm your eligibility. Participation in Club golf days and events is at your own risk. You are responsible for your own conduct, health and fitness to play, and to the maximum extent permitted by law the Club accepts no liability for personal injury, or for loss of or damage to property, arising from your participation in an event. You must comply with the rules, directions and etiquette of the host venue and of Club officials; the Club may refuse or cancel an entry, or remove a participant from an event, for unsafe or inappropriate conduct. Event details, venues and fees may change, and we will let you know if they do. Events may be photographed or filmed for the Club's website and social media — if you would prefer your image not be used, please tell a committee member at the event or email the Club.",
  },
  {
    heading: "Payments",
    body: "Payments are processed securely by Square. By paying you authorise the charge shown. All prices are in Australian dollars. The Club is not registered for GST, and no GST applies to its fees; prices are as displayed and no tax invoices are issued.",
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
