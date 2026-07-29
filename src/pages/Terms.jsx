import RibbonRule from "../components/RibbonRule.jsx";

{/* REVIEW BEFORE PUBLISHING — starting template, not legal advice. Fill every [BRACKETED] placeholder and have the club confirm the refund + liability sections. */}

const sections = [
  {
    heading: "Membership",
    body: "Membership is $50 per year and includes a club hat or t-shirt. Membership is confirmed once your enquiry is accepted and payment is received. [Add renewal terms — e.g. whether membership auto-renews or is re-purchased each year.]",
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
    body: "[Set the Club's policy here — e.g. whether event fees are refundable and up to what date. Faulty or misdescribed merchandise is covered by your rights under the Australian Consumer Law, which these terms do not exclude.]",
  },
  {
    heading: "Merchandise",
    body: "Orders are fulfilled by pickup at events or by post, as selected at checkout. [Confirm when risk/ownership passes and any postage terms.]",
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
    body: "Questions? Email [seqdvgc@gmail.com].",
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
            Last updated: [DATE]
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="max-w-[68ch] text-lg text-ink">
            This website is operated by South East Queensland Defence Veterans
            Golf Club Inc. [ABN: ______]. By using this site you agree to these
            terms.
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
