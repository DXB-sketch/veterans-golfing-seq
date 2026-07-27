import { useState } from "react";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

export default function Membership() {
  const [sent, setSent] = useState(false);

  // Mock-up only: no backend yet. V1 will post to Supabase / email endpoint.
  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <section className="bg-navy px-5 py-16 text-center md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
            Together we play. Together we grow.
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Join the club
          </h1>
          <div className="mt-5 flex justify-center">
            <RibbonRule dark />
          </div>
        </div>
      </section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold uppercase text-navy">
              What membership gets you
            </h2>
            <RibbonRule className="mt-3" />
            <ul className="mt-6 space-y-4 text-ink">
              {[
                ["$50 a year", "That's it. No hidden fees, no fine print."],
                ["A club hat or t-shirt", "Your choice — wear the colours with pride."],
                ["A community that gets it", "Play alongside veterans and families from all three services."],
                ["Events across SEQ", "Brisbane, Sunshine Coast and Gold Coast rounds through the year."],
              ].map(([title, line]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-ink-muted">{line}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink-muted">
              Fill in the form and we&apos;ll be in touch about payment and
              getting you kitted out. All veterans — serving and ex-serving —
              and family members are welcome.
            </p>
          </div>

          <div className="lg:col-span-3">
            {sent ? (
              <div className="rounded-card bg-paper p-10 text-center shadow-soft">
                <p className="font-display text-2xl font-semibold uppercase text-navy">
                  Thanks — we&apos;ve got it
                </p>
                <RibbonRule className="mt-3" />
                <p className="mt-4 text-ink-muted">
                  We&apos;ll be in touch at the email you gave us within a few
                  days. Looking forward to seeing you on the course.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid gap-5 rounded-card bg-paper p-8 shadow-soft sm:grid-cols-2"
              >
                <FormField label="Full name" id="name" required autoComplete="name" />
                <FormField label="Email" id="email" type="email" required autoComplete="email" />
                <FormField label="Phone" id="phone" type="tel" autoComplete="tel" />
                <FormField
                  label="Service branch"
                  id="branch"
                  as="select"
                  required
                  options={["Army", "Navy", "Air Force", "Family member"]}
                />
                <div className="sm:col-span-2">
                  <FormField
                    label="Playing / handicap info"
                    id="handicap"
                    placeholder="e.g. Handicap 18, social player, just starting out…"
                  />
                </div>
                <FormField
                  label="Hat or t-shirt?"
                  id="merch"
                  as="select"
                  required
                  options={["Hat", "T-shirt"]}
                />
                <FormField
                  label="Size (if t-shirt)"
                  id="size"
                  as="select"
                  options={["S", "M", "L", "XL", "2XL", "3XL"]}
                />
                <div className="sm:col-span-2">
                  <FormField
                    label="Pickup or delivery?"
                    id="fulfilment"
                    as="select"
                    required
                    options={["Pick up at an event", "Post it to me"]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full sm:w-auto">
                    Send enquiry
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
