import { useState } from "react";
import {
  PaymentForm,
  CreditCard,
  ApplePay,
  GooglePay,
} from "react-square-web-payments-sdk";

const MEMBERSHIP_CENTS = 5000; // display only — the server decides the real charge

const LABELS = {
  membership: "SEQDVGC membership",
  donation: "SEQDVGC donation",
  sponsorship: "SEQDVGC sponsorship",
  event_booking: "SEQDVGC event booking",
};

function displayTotal(purpose, amountCents) {
  const cents = purpose === "membership" ? MEMBERSHIP_CENTS : amountCents || 0;
  return (cents / 100).toFixed(2);
}

// Internal — only ever rendered by SquarePayment.jsx once env vars exist.
export default function SquarePaymentForm({
  appId,
  locationId,
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
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);

  async function handleToken(tokenResult) {
    if (tokenResult.status !== "OK") {
      setError(
        "Sorry, your card details couldn't be processed. Please check them and try again."
      );
      return;
    }
    setError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenResult.token,
          purpose,
          amountCents,
          payerName,
          payerEmail,
          member,
          sponsor,
          booking,
          accessToken,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPaid(true);
        onSuccess?.(data.paymentId, data);
      } else {
        // Some failures need the caller to react (e.g. a tee slot filling up
        // mid-payment) — hand the response over before showing the message.
        onError?.(data);
        setError(
          data.error ||
            "Sorry, the payment didn't go through. You haven't been charged. Please try again, or email us at seqdvgc@gmail.com."
        );
      }
    } catch {
      setError(
        "Sorry, we couldn't reach the payment service. Please check your internet connection and try again, or email us at seqdvgc@gmail.com."
      );
    } finally {
      setPaying(false);
    }
  }

  if (paid) {
    return (
      <div className="border-t-4 border-gold bg-paper p-6 text-center">
        <p className="font-display text-lg font-semibold tracking-wide text-navy">
          Payment received, thank you
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          A receipt will be sent by Square to the card&apos;s email if one is on
          file.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={handleToken}
        createPaymentRequest={() => ({
          countryCode: "AU",
          currencyCode: "AUD",
          total: {
            amount: displayTotal(purpose, amountCents),
            label: LABELS[purpose] || "SEQDVGC payment",
          },
        })}
      >
        <div className="space-y-3">
          <ApplePay />
          <GooglePay />
          <CreditCard
            buttonProps={{
              isLoading: paying,
              css: {
                backgroundColor: "#C8A02E",
                color: "#07152B",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#E4C158" },
              },
            }}
          >
            {paying ? "Processing…" : `Pay A$${displayTotal(purpose, amountCents)}`}
          </CreditCard>
        </div>
      </PaymentForm>
      {error && (
        <p className="mt-4 border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
          {error}
        </p>
      )}
    </div>
  );
}
