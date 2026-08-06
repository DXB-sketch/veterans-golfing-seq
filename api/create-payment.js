import { randomUUID } from "node:crypto";
import { serviceClient } from "./_lib/supabase.js";
import { tierFromAmountCents, SPONSORSHIP_MIN_CENTS } from "./_lib/tiers.js";

// Server-decided prices — never trust the client for amounts.
const MEMBERSHIP_CENTS = 5000; // AUD $50 fixed
const DONATION_MIN_CENTS = 500; // AUD $5
const DONATION_MAX_CENTS = 700000; // AUD $7,000
const SPONSORSHIP_MAX_CENTS = 1000000; // AUD $10,000 sanity cap

function bad(res, msg) {
  return res.status(400).json({ ok: false, error: msg });
}

function cleanText(v, max = 300) {
  return typeof v === "string" ? v.trim().slice(0, max) : null;
}

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

  const body = req.body || {};
  const { token, purpose } = body;
  if (!token || typeof token !== "string") {
    return bad(res, "Missing payment token.");
  }

  // --- Authoritative amount ------------------------------------------------
  let chargeCents;
  let note;
  if (purpose === "membership") {
    chargeCents = MEMBERSHIP_CENTS;
    note = "SEQDVGC annual membership";
    if (!cleanText(body.member?.name) || !cleanText(body.member?.email)) {
      return bad(res, "Membership payments need the member's name and email.");
    }
  } else if (purpose === "donation") {
    const amount = body.amountCents;
    if (
      !Number.isInteger(amount) ||
      amount < DONATION_MIN_CENTS ||
      amount > DONATION_MAX_CENTS
    ) {
      return bad(res, "Donation amount must be between $5 and $7,000 AUD.");
    }
    chargeCents = amount;
    note = "SEQDVGC donation";
  } else if (purpose === "sponsorship") {
    const amount = body.amountCents;
    if (
      !Number.isInteger(amount) ||
      amount < SPONSORSHIP_MIN_CENTS ||
      amount > SPONSORSHIP_MAX_CENTS
    ) {
      return bad(res, "Sponsorship starts at $250 AUD (below that, it's a donation — thank you!).");
    }
    if (!cleanText(body.sponsor?.companyName) || !cleanText(body.sponsor?.contactEmail)) {
      return bad(res, "Sponsorship payments need a company name and contact email.");
    }
    chargeCents = amount;
    note = "SEQDVGC sponsorship";
  } else {
    return bad(res, "Unknown payment purpose.");
  }

  // --- Charge via Square ---------------------------------------------------
  const base =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  let payment;
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
        location_id: process.env.SQUARE_LOCATION_ID || process.env.VITE_SQUARE_LOCATION_ID,
        note,
        reference_id: purpose,
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
    payment = data.payment;
  } catch (err) {
    console.error("Square request error", err);
    return res
      .status(502)
      .json({ ok: false, error: "Couldn't reach the payment service." });
  }

  // --- Record + purpose side effects (service role) ------------------------
  // The card has been charged: from here on, failures are logged and reported
  // as warnings, never surfaced as a payment failure.
  const supabase = serviceClient();
  let referenceId = null;
  let payerName = cleanText(body.payerName, 120);
  let payerEmail = cleanText(body.payerEmail, 254);

  if (!supabase) {
    console.error("Payment recorded in Square only — service role env missing.", {
      purpose,
      squarePaymentId: payment?.id,
    });
    return res.status(200).json({ ok: true, paymentId: payment?.id });
  }

  try {
    if (purpose === "membership") {
      const m = body.member;
      payerName = payerName || cleanText(m.name, 120);
      payerEmail = payerEmail || cleanText(m.email, 254);
      const email = cleanText(m.email, 254);
      const joined = new Date().toLocaleDateString("en-CA", {
        timeZone: "Australia/Brisbane",
      });
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-CA",
        { timeZone: "Australia/Brisbane" }
      );
      const { data: memberRow, error } = await supabase
        .from("members")
        .upsert(
          {
            name: cleanText(m.name, 120),
            email,
            phone: cleanText(m.phone, 40),
            service_branch: cleanText(m.serviceBranch, 60),
            ga_handicap: typeof m.gaHandicap === "boolean" ? m.gaHandicap : null,
            golf_links_number: cleanText(m.golfLinksNumber, 40),
            status: "active",
            joined_at: joined,
            expires_at: expires,
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();
      if (error) throw error;
      referenceId = memberRow.id;

      // Invite the paid member to create their login. Origin comes from the
      // request so previews invite back to themselves.
      const origin =
        (req.headers["x-forwarded-proto"] || "https") +
        "://" +
        (req.headers["x-forwarded-host"] || req.headers.host || "seqdvgc.com.au");
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/member/welcome`,
      });
      if (inviteError && !`${inviteError.message}`.includes("already")) {
        console.error("Member invite failed", inviteError);
      }
    } else if (purpose === "sponsorship") {
      const s = body.sponsor;
      payerName = payerName || cleanText(s.contactName, 120);
      payerEmail = payerEmail || cleanText(s.contactEmail, 254);
      const { data: sponsorRow, error } = await supabase
        .from("sponsors")
        .insert({
          company_name: cleanText(s.companyName, 160),
          website_url: cleanText(s.websiteUrl, 300),
          description: cleanText(s.description, 600),
          tier: tierFromAmountCents(chargeCents), // server-computed, never client
          amount_cents: chargeCents,
          contact_name: cleanText(s.contactName, 120),
          contact_email: cleanText(s.contactEmail, 254),
          is_active: false, // pending logo + committee approval
        })
        .select("id")
        .single();
      if (error) throw error;
      referenceId = sponsorRow.id;
    }

    const { error: payError } = await supabase.from("payments").insert({
      square_payment_id: payment?.id,
      amount_cents: chargeCents,
      currency: "AUD",
      purpose,
      reference_id: referenceId,
      payer_name: payerName,
      payer_email: payerEmail,
      status: payment?.status === "COMPLETED" ? "completed" : (payment?.status || "completed").toLowerCase(),
    });
    if (payError) throw payError;
  } catch (err) {
    console.error("Post-payment recording failed", { purpose, squarePaymentId: payment?.id, err });
  }

  return res.status(200).json({ ok: true, paymentId: payment?.id });
}
