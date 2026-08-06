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
        ga_handicap: f.get("ga_handicap") || null,
        golf_links_number: f.get("golf_links") || null,
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
            <p className="mt-4 max-w-xl text-lg text-cream/90">
              Membership fees help cover administrative costs, championship
              accommodation and fees, and event prizes.
            </p>
          </div>
          <div className="flex flex-col items-start justify-center gap-1 bg-gold px-10 py-10 text-navy-deep md:w-72 md:items-center md:py-0 md:text-center">
            <p className="font-display text-5xl font-bold">$50</p>
            <p className="font-body text-sm font-bold uppercase tracking-[0.14em]">
              per year
            </p>
            <p className="mt-2 text-sm font-semibold">
              Includes a club hat
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
                ["A club hat", "Wear the colours with pride — handed to you at your first event."],
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
                  label="Do you have a GA handicap?"
                  id="ga_handicap"
                  as="select"
                  required
                  options={["Yes", "No"]}
                />
                <FormField
                  label="Golf Links number"
                  id="golf_links"
                  placeholder="Leave blank if you don't have one"
                />
                <p className="text-sm text-ink-muted sm:col-span-2">
                  Your club hat will be given to you at your first event.
                </p>
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

      <JoinAndPay />
    </>
  );
}

// "Become a member" — the paid, self-serve join path. Go-live flag (brief,
// Phase 6): the club's public timeline opens membership in early 2027, so
// this is deliberately built visible but low-pressure, placed after the
// register-interest form. If the club decides to hold it until 2027, remove
// <JoinAndPay /> above (one line) — everything else keeps working.
function JoinAndPay() {
  const [details, setDetails] = useState(null);
  const [paid, setPaid] = useState(false);

  function handleDetails(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setDetails({
      name: f.get("join_name").trim(),
      email: f.get("join_email").trim(),
      phone: f.get("join_phone")?.trim() || null,
      serviceBranch: f.get("join_branch"),
      gaHandicap: f.get("join_ga_handicap") === "Yes",
      golfLinksNumber: f.get("join_golf_links")?.trim() || null,
    });
  }

  return (
    <section className="bg-paper px-5 py-16 md:py-24">
      <div className="mx-auto max-w-site">
        <div className="mx-auto max-w-2xl">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Ready to join now?
          </p>
          <h2 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight tracking-wide text-navy">
            Become a member — $50/year
          </h2>
          <RibbonRule className="mt-4" />
          <p className="mt-5 text-ink-muted">
            If you&apos;d rather skip the wait, you can join and pay online
            right now. No pressure — the enquiry form above works just as well
            if you&apos;d like a chat first.
          </p>

          {paid ? (
            <div className="mt-8 border-t-4 border-gold bg-cream p-8 text-center md:p-10">
              <p className="font-display text-2xl font-semibold tracking-wide text-navy">
                Payment received — welcome to the club!
              </p>
              <RibbonRule className="mt-3" />
              <p className="mt-4 text-ink-muted">
                You&apos;re now a member of the South East Queensland Defence
                Veterans Golf Club. An email invite to set up your member login
                is on its way to {details?.email} — if it doesn&apos;t arrive
                in the next few minutes, please check your spam folder.
              </p>
              <p className="mt-3 text-ink-muted">
                Your club hat will be given to you at your first event. See you
                on the course.
              </p>
            </div>
          ) : details ? (
            <div className="mt-8 border-t-4 border-gold bg-cream p-8 md:p-10">
              <p className="font-semibold text-ink">
                Annual membership for {details.name}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                $50.00 AUD — includes your club hat.{" "}
                <button
                  type="button"
                  onClick={() => setDetails(null)}
                  className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                >
                  Change your details
                </button>
              </p>
              <div className="mt-6">
                <SquarePayment
                  purpose="membership"
                  payerName={details.name}
                  payerEmail={details.email}
                  member={details}
                  onSuccess={() => setPaid(true)}
                />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleDetails}
              className="mt-8 grid gap-5 border-t-4 border-gold bg-cream p-8 sm:grid-cols-2 md:p-10"
            >
              <FormField label="Full name" id="join_name" required autoComplete="name" />
              <FormField label="Email" id="join_email" type="email" required autoComplete="email" />
              <FormField label="Phone" id="join_phone" type="tel" autoComplete="tel" />
              <FormField
                label="Service branch"
                id="join_branch"
                as="select"
                required
                options={["Army", "Navy", "Air Force", "Family member"]}
              />
              <FormField
                label="Do you have a GA handicap?"
                id="join_ga_handicap"
                as="select"
                required
                options={["Yes", "No"]}
              />
              <FormField
                label="Golf Links number"
                id="join_golf_links"
                placeholder="Leave blank if you don't have one"
              />
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Continue to payment
                </Button>
                <p className="mt-3 text-sm text-ink-muted">
                  You&apos;ll confirm your details before paying. By joining,
                  you agree to our{" "}
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
  );
}
