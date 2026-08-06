import { useState } from "react";
import { Link } from "react-router-dom";
import RibbonRule from "../components/RibbonRule.jsx";
import SquarePayment from "../components/SquarePayment.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

// Joining is the paid, self-serve flow: details → confirm → pay $50 → the
// server records the member and emails a login invite. The old
// "register interest" enquiry form was retired at the club's request —
// enquiry-style forms now belong to volunteering (Contact page).
export default function Membership() {
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
              their family members. Join and pay online in a couple of minutes,
              and your club hat will be waiting at your first event.
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
                ["A club hat", "Wear the colours with pride. Handed to you at your first event."],
                ["A community that gets it", "Play alongside veterans and families from all three services."],
                ["Events across SEQ", "Brisbane, Sunshine Coast and Gold Coast rounds through the year."],
              ].map(([title, line]) => (
                <li key={title} className="py-4">
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{line}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink-muted">
              Questions before joining? Reach us via the{" "}
              <Link
                to="/contact"
                className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
              >
                contact page
              </Link>
              . Want to help out instead of playing?{" "}
              <Link
                to="/contact#volunteer"
                className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
              >
                Volunteer with us
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-3">
            <JoinAndPay />
          </div>
        </div>
      </section>
    </>
  );
}

function JoinAndPay() {
  const [details, setDetails] = useState(null);
  const [paid, setPaid] = useState(false);
  // Whether the server managed to email the login invite — when it couldn't,
  // the success panel must not promise an email that isn't coming.
  const [inviteSent, setInviteSent] = useState(false);

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

  if (paid) {
    return (
      <div className="border-t-4 border-gold bg-paper p-8 text-center md:p-10">
        <p className="font-display text-2xl font-semibold tracking-wide text-navy">
          Payment received. Welcome to the club!
        </p>
        <RibbonRule className="mt-3" />
        {inviteSent ? (
          <p className="mt-4 text-ink-muted">
            You&apos;re now a member of the South East Queensland Defence
            Veterans Golf Club. An email invite to set up your member login
            is on its way to {details?.email}. If it doesn&apos;t arrive
            in the next few minutes, please check your spam folder.
          </p>
        ) : (
          <p className="mt-4 text-ink-muted">
            You&apos;re now a member of the South East Queensland Defence
            Veterans Golf Club. Your payment has been received, and the
            club will be in touch to set up your member login. If you
            don&apos;t hear from us within a few days, email us at
            seqdvgc@gmail.com.
          </p>
        )}
        <p className="mt-3 text-ink-muted">
          Your club hat will be given to you at your first event. See you
          on the course.
        </p>
      </div>
    );
  }

  if (details) {
    return (
      <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
        <p className="font-semibold text-ink">
          Annual membership for {details.name}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          $50.00 AUD, includes your club hat.{" "}
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
            onSuccess={(paymentId, data) => {
              setInviteSent(data?.inviteSent === true);
              setPaid(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleDetails}
      className="grid gap-5 border-t-4 border-gold bg-paper p-8 sm:grid-cols-2 md:p-10"
    >
      <div className="sm:col-span-2">
        <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
          Become a member: $50/year
        </h2>
        <RibbonRule className="mt-3" />
      </div>
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
      <p className="text-sm text-ink-muted sm:col-span-2">
        Your club hat will be given to you at your first event.
      </p>
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
  );
}
