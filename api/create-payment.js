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
  } else if (purpose === "event_booking") {
    // Amount is computed from the event's own fees AFTER the DB is reachable
    // (below) — the client never sets it. Validate the payload shape here.
    const b = body.booking || {};
    if (!cleanText(b.playerName) || !b.eventId || !b.teeSlotId) {
      return bad(res, "Booking payments need a player name, event and tee slot.");
    }
    note = "SEQDVGC event booking";
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
    if (purpose === "event_booking") {
      probes.push(supabase.from("bookings").select("id", { head: true, count: "exact" }).limit(1));
    }
    const results = await Promise.all(probes);
    if (results.some((r) => r.error)) {
      console.error("Payment refused — recording tables unavailable", results.map((r) => r.error?.message));
      return res
        .status(503)
        .json({ ok: false, error: "Online payments are not quite ready yet — please try again soon or email us." });
    }
  }

  // --- Event bookings: price from the event's fees, reserve BEFORE charging -
  // The slot is held by inserting the booking (the capacity trigger enforces
  // availability atomically); if the card then declines, the hold is released.
  let bookingRowId = null;
  if (purpose === "event_booking") {
    const b = body.booking;
    const { data: ev, error: evError } = await supabase
      .from("events")
      .select("id, status, is_locked, event_date, green_fee, cart_fee, side_comp")
      .eq("id", b.eventId)
      .maybeSingle();
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Brisbane" });
    if (
      evError || !ev || ev.status !== "published" || !ev.is_locked ||
      !ev.event_date || ev.event_date < today
    ) {
      return bad(res, "Bookings aren't open for this event.");
    }
    const { data: slot } = await supabase
      .from("tee_slots")
      .select("id, event_id")
      .eq("id", b.teeSlotId)
      .maybeSingle();
    if (!slot || slot.event_id !== ev.id) {
      return bad(res, "That tee slot doesn't belong to this event.");
    }

    const cents = (v) => Math.round(Number(v || 0) * 100);
    chargeCents =
      cents(ev.green_fee) +
      (b.cartHire === true ? cents(ev.cart_fee) : 0) +
      (b.playingInComp === true ? cents(ev.side_comp) : 0);
    if (!Number.isInteger(chargeCents) || chargeCents <= 0) {
      return bad(res, "This event has no fees to pay online — book directly on the event page.");
    }

    // Signed-in members get their booking linked so it shows on the dashboard.
    let createdBy = null;
    if (typeof body.accessToken === "string" && body.accessToken) {
      const { data: userData } = await supabase.auth.getUser(body.accessToken);
      createdBy = userData?.user?.id || null;
    }

    const { data: bookingRow, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        event_id: ev.id,
        tee_slot_id: slot.id,
        player_name: cleanText(b.playerName, 120),
        mobile: cleanText(b.mobile, 40),
        ga_handicap: typeof b.gaHandicap === "boolean" ? b.gaHandicap : null,
        golf_links_number: cleanText(b.golfLinksNumber, 40),
        playing_in_comp: b.playingInComp === true,
        cart_hire: b.cartHire === true,
        created_by: createdBy,
      })
      .select("id")
      .single();
    if (bookingError) {
      const msg = bookingError.message || "";
      if (msg.includes("SLOT_FULL")) {
        return res.status(409).json({ ok: false, code: "slot_full", error: "That tee time just filled up — please pick another slot." });
      }
      if (msg.includes("EVENT_NOT_BOOKABLE")) {
        return bad(res, "Bookings aren't open for this event.");
      }
      console.error("Booking insert failed", bookingError);
      return res.status(502).json({ ok: false, error: "Couldn't hold your tee slot. You haven't been charged — please try again." });
    }
    bookingRowId = bookingRow.id;
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
      if (bookingRowId) {
        await supabase.from("bookings").delete().eq("id", bookingRowId);
      }
      return res.status(402).json({
        ok: false,
        error:
          "The payment was declined. You haven't been charged and your tee slot wasn't taken — please try another card.",
      });
    }
    payment = data.payment;
  } catch (err) {
    console.error("Square request error", err);
    if (bookingRowId) {
      await supabase.from("bookings").delete().eq("id", bookingRowId);
    }
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
    cleanText(body.sponsor?.contactName, 120) ||
    cleanText(body.booking?.playerName, 120);
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
    if (purpose === "event_booking") {
      referenceId = bookingRowId;
      await supabase
        .from("bookings")
        .update({ paid_cents: chargeCents, square_payment_id: payment?.id })
        .eq("id", bookingRowId);
    } else if (purpose === "membership") {
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

      // Invite the paid member to create their login. Production always uses
      // the canonical domain (it must match Supabase's redirect allowlist);
      // previews invite back to themselves.
      const origin =
        process.env.VERCEL_ENV === "production"
          ? "https://www.seqdvgc.com.au"
          : (req.headers["x-forwarded-proto"] || "https") +
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
