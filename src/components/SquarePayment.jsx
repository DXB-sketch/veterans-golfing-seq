import { lazy, Suspense } from "react";
import RibbonRule from "./RibbonRule.jsx";

const appId = import.meta.env.VITE_SQUARE_APP_ID;
const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
const configured = Boolean(appId && locationId);

// The Square SDK is only imported (and only loads its script) when the env
// vars exist — unconfigured builds ship none of it and make zero network calls.
const SquarePaymentForm = configured
  ? lazy(() => import("./SquarePaymentForm.jsx"))
  : null;

// purpose: "membership" | "donation" | "sponsorship" | "event_booking".
// amountCents applies to donations/sponsorship; membership is fixed and event
// bookings are re-priced server-side from the event's fees (amountCents is
// display-only there). member / sponsor / booking / payerName / payerEmail /
// accessToken are forwarded to /api/create-payment for the purpose's side
// effects after a successful charge.
export default function SquarePayment({
  purpose,
  amountCents,
  payerName,
  payerEmail,
  member,
  sponsor,
  booking,
  accessToken,
  onSuccess,
  onError,
}) {
  if (!configured) {
    return (
      <div className="border border-ink/10 bg-paper p-6 text-center">
        <RibbonRule />
        <p className="mt-3 font-display text-lg font-semibold tracking-wide text-navy">
          Online payments coming soon
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          We&apos;re setting up secure card payments with Square. For now,
          we&apos;ll sort payment with you by email.
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={<p className="text-sm text-ink-muted">Loading secure payment form…</p>}
    >
      <SquarePaymentForm
        // The SDK freezes the Apple/Google Pay sheet amount at mount — key the
        // form by amount so changing it remounts and the wallets stay honest.
        key={`${purpose}-${amountCents ?? "fixed"}`}
        appId={appId}
        locationId={locationId}
        purpose={purpose}
        amountCents={amountCents}
        payerName={payerName}
        payerEmail={payerEmail}
        member={member}
        sponsor={sponsor}
        booking={booking}
        accessToken={accessToken}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Suspense>
  );
}
