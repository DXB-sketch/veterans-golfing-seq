import { randomUUID } from "node:crypto";

// Server-decided prices — never trust the client for fixed items.
const MEMBERSHIP_CENTS = 5000; // AUD $50
const DONATION_MIN_CENTS = 200; // AUD $2
const DONATION_MAX_CENTS = 700000; // AUD $7,000

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) {
    return res
      .status(503)
      .json({ ok: false, error: "Online payments are not configured yet." });
  }

  const { token, itemType, amount } = req.body || {};
  if (!token || typeof token !== "string") {
    return res.status(400).json({ ok: false, error: "Missing payment token." });
  }

  let chargeCents;
  if (itemType === "membership") {
    chargeCents = MEMBERSHIP_CENTS;
  } else if (itemType === "donation") {
    if (
      !Number.isInteger(amount) ||
      amount < DONATION_MIN_CENTS ||
      amount > DONATION_MAX_CENTS
    ) {
      return res.status(400).json({
        ok: false,
        error: "Donation amount must be between $2 and $7,000 AUD.",
      });
    }
    chargeCents = amount;
  } else {
    return res.status(400).json({ ok: false, error: "Unknown item type." });
  }

  const base =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  try {
    const squareRes = await fetch(`${base}/v2/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Square-Version": "2025-01-23",
      },
      body: JSON.stringify({
        source_id: token,
        idempotency_key: randomUUID(),
        amount_money: { amount: chargeCents, currency: "AUD" },
        note:
          itemType === "membership"
            ? "SEQDVGC annual membership"
            : "SEQDVGC donation",
        reference_id: itemType,
      }),
    });

    const data = await squareRes.json();
    if (!squareRes.ok) {
      console.error("Square payment failed", data.errors);
      return res.status(402).json({
        ok: false,
        error:
          "The payment was declined. You haven't been charged — please try another card.",
      });
    }

    return res.status(200).json({ ok: true, paymentId: data.payment?.id });
  } catch (err) {
    console.error("Square request error", err);
    return res
      .status(502)
      .json({ ok: false, error: "Couldn't reach the payment service." });
  }
}
