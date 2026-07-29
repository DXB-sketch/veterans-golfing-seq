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

// itemType: "membership" | "donation". amount (cents) only applies to donations.
export default function SquarePayment({ itemType, amount, onSuccess }) {
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
        appId={appId}
        locationId={locationId}
        itemType={itemType}
        amount={amount}
        onSuccess={onSuccess}
      />
    </Suspense>
  );
}
