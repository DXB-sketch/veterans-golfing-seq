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

function cleanEmail(v) {
  const s = cleanText(v, 254);
  return s ? s.toLowerCase() : null;
}

function cleanUrl(v) {
  const s = cleanText(v, 300);
  if (!s) return null;
  try {
    const u = new URL(s.includes("://") ? s : `https://${s}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
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
    if (!Number.isInteger(amount) || amount < SPONSORSHIP_MIN_CENTS) {
      return bad(res, "Sponsorship starts at $250 AUD (below that, it's a donation — thank you!).");
    }
    if (amount > SPONSORSHIP_MAX_CENTS) {
      return bad(res, "For sponsorships over $10,000 AUD, please email us so we can arrange it directly.");
    }
    if (!cleanText(body.sponsor?.companyName) || !cleanText(body.sponsor?.contactEmail)) {
      return bad(res, "Sponsorship payments need a company name and contact email.");
    }
    chargeCents = amount;
    note = "SEQDVGC sponsorship";
  } else {
    return bad(res, "Unknown payment purpose.");
  }

  // --- Pre-flight: never charge a card we can't record ---------------------
  // Until the foundation migration is applied (payments/members/sponsors
  // tables), taking money would strand the charge in Square with no local
  // record and no side effects — so refuse up front instead.
  const supabase = serviceClient();
  if (!supabase) {
    return res
      .status(503)
      .json({ ok: false, error: "Online payments are not quite ready yet — please try again soon or email us." });
  }
  {
    const probes = [supabase.from("payments").select("id", { head: true, count: "exact" }).limit(1)];
    if (purpose === "membership") {
      probes.push(supabase.from("members").select("id", { head: true, count: "exact" }).limit(1));
    }
    if (purpose === "sponsorship") {
      probes.push(supabase.from("sponsors").select("id", { head: true, count: "exact" }).limit(1));
    }
    const results = await Promise.all(probes);
    if (results.some((r) => r.error)) {
      console.error("Payment refused — recording tables unavailable", results.map((r) => r.error?.message));
      return res
        .status(503)
        .json({ ok: false, error: "Online payments are not quite ready yet — please try again soon or email us." });
    }
  }

  // --- Charge via Square ---------------------------------------------------
  const environment =
    process.env.SQUARE_ENVIRONMENT || process.env.VITE_SQUARE_ENVIRONMENT;
  const base =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const buyerEmail =
    cleanEmail(body.payerEmail) ||
    cleanEmail(body.member?.email) ||
    cleanEmail(body.sponsor?.contactEmail);

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
        buyer_email_address: buyerEmail || undefined,
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
  // The card has been charged: from here on, failures are logged (with enough
  // detail to recover the sale) and reported as flags, never as a payment
  // failure. The payments row is written FIRST so the money is never without
  // a local record even if a side effect fails.
  const payerName =
    cleanText(body.payerName, 120) ||
    cleanText(body.member?.name, 120) ||
    cleanText(body.sponsor?.contactName, 120);
  const payerEmail = buyerEmail;

  let recorded = false;
  let paymentRowId = null;
  try {
    const { data: payRow, error: payError } = await supabase
      .from("payments")
      .insert({
        square_payment_id: payment?.id,
        amount_cents: chargeCents,
        currency: "AUD",
        purpose,
        payer_name: payerName,
        payer_email: payerEmail,
        status:
          payment?.status === "COMPLETED"
            ? "completed"
            : (payment?.status || "completed").toLowerCase(),
      })
      .select("id")
      .single();
    if (payError) throw payError;
    recorded = true;
    paymentRowId = payRow.id;
  } catch (err) {
    console.error("PAYMENT NOT RECORDED — recover from Square", {
      purpose,
      squarePaymentId: payment?.id,
      payerEmail,
      err: err?.message || err,
    });
  }

  let inviteSent = false;
  let referenceId = null;
  try {
    if (purpose === "membership") {
      const m = body.member;
      const email = cleanEmail(m.email);
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
      if (!inviteError || `${inviteError.message}`.includes("already")) {
        inviteSent = true; // already-registered counts: they have a login
      } else {
        console.error("Member invite failed", inviteError);
      }
    } else if (purpose === "sponsorship") {
      const s = body.sponsor;
      const { data: sponsorRow, error } = await supabase
        .from("sponsors")
        .insert({
          company_name: cleanText(s.companyName, 160),
          website_url: cleanUrl(s.websiteUrl), // http(s) only — never store js: URLs
          description: cleanText(s.description, 600),
          tier: tierFromAmountCents(chargeCents), // server-computed, never client
          amount_cents: chargeCents,
          contact_name: cleanText(s.contactName, 120),
          contact_email: cleanEmail(s.contactEmail),
          is_active: false, // pending logo + committee approval
        })
        .select("id")
        .single();
      if (error) throw error;
      referenceId = sponsorRow.id;
    }

    if (recorded && referenceId) {
      await supabase.from("payments").update({ reference_id: referenceId }).eq("id", paymentRowId);
    }
  } catch (err) {
    console.error("Post-payment side effect failed", {
      purpose,
      squarePaymentId: payment?.id,
      payerEmail,
      err: err?.message || err,
    });
  }

  return res
    .status(200)
    .json({ ok: true, paymentId: payment?.id, recorded, inviteSent });
}
