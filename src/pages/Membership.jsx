import { useState } from "react";
import { Link } from "react-router-dom";
import RibbonRule from "../components/RibbonRule.jsx";
import SquarePayment from "../components/SquarePayment.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import { supabase } from "../lib/supabase.js";

export default function Membership() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setError(null);
    setSending(true);
    const { error: insertError } = await supabase
      .from("membership_enquiries")
      .insert({
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone") || null,
        service_branch: f.get("branch") || null,
        playing_info: f.get("handicap") || null,
        apparel_choice: f.get("merch") || null,
        apparel_size: f.get("size") || null,
        delivery_pref: f.get("fulfilment") || null,
      });
    setSending(false);
    if (insertError) {
      setError(
        "Sorry, your enquiry didn't go through. Please check your internet connection and try again, or email us at seqdvgc@gmail.com."
      );
    } else {
      setSent(true);
    }
  }

  return (
    <>
      {/* Membership identity: navy hero split with a solid gold price panel. */}
      <section className="bg-navy px-5">
        <div className="mx-auto flex max-w-site flex-col md:flex-row md:items-stretch">
          <div className="flex-1 py-14 md:py-20 md:pr-12">
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
              Together we play. Together we grow.
            </p>
            <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
              Join the club
            </h1>
            <RibbonRule className="mt-5" dark />
            <p className="mt-6 max-w-xl text-lg text-cream/90">
              Membership is open to all veterans, serving and ex-serving, and
              their family members. Fill in the form and we&apos;ll be in touch
              about payment and getting you kitted out.
            </p>
          </div>
          <div className="flex flex-col items-start justify-center gap-1 bg-gold px-10 py-10 text-navy-deep md:w-72 md:items-center md:py-0 md:text-center">
            <p className="font-display text-5xl font-bold">$50</p>
            <p className="font-body text-sm font-bold uppercase tracking-[0.14em]">
              per year
            </p>
            <p className="mt-2 text-sm font-semibold">
              Includes a club hat or t-shirt
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto grid max-w-site gap-14 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
              What membership gets you
            </h2>
            <RibbonRule className="mt-3" />
            <ul className="mt-8 divide-y divide-ink/10">
              {[
                ["$50 a year", "That's it. No hidden fees, no fine print."],
                ["A club hat or t-shirt", "Your choice. Wear the colours with pride."],
                ["A community that gets it", "Play alongside veterans and families from all three services."],
                ["Events across SEQ", "Brisbane, Sunshine Coast and Gold Coast rounds through the year."],
              ].map(([title, line]) => (
                <li key={title} className="py-4">
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{line}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            {sent ? (
              <div className="border-t-4 border-gold bg-paper p-10 text-center">
                <p className="font-display text-2xl font-semibold tracking-wide text-navy">
                  Thanks, we&apos;ve got it
                </p>
                <RibbonRule className="mt-3" />
                <p className="mt-4 text-ink-muted">
                  We&apos;ll be in touch at the email you gave us within a few
                  days. Looking forward to seeing you on the course.
                </p>
                <div className="mt-8 text-left">
                  <SquarePayment itemType="membership" />
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid gap-5 border-t-4 border-gold bg-paper p-8 sm:grid-cols-2 md:p-10"
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
                    placeholder="e.g. Handicap 18, social player, just starting out"
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
                {error && (
                  <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink sm:col-span-2">
                    {error}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                    {sending ? "Sending…" : "Send enquiry"}
                  </Button>
                  <p className="mt-3 text-sm text-ink-muted">
                    By submitting, you agree to our{" "}
                    <Link to="/privacy" className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
