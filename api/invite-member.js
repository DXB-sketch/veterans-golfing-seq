import { serviceClient } from "./_lib/supabase.js";

// Committee-only: send a Supabase Auth invite to a member's email — used when
// the committee records a cash/in-person membership. The caller must present
// a valid session token belonging to a committee profile.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const supabase = serviceClient();
  if (!supabase) {
    return res
      .status(503)
      .json({ ok: false, error: "Member invites are not configured yet." });
  }

  const jwt = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return res.status(401).json({ ok: false, error: "Not signed in." });

  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !userData?.user) {
    return res.status(401).json({ ok: false, error: "Not signed in." });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profile?.role !== "committee") {
    return res.status(403).json({ ok: false, error: "Committee access only." });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "A valid email is required." });
  }

  // Only paid/recorded members may be invited — that's the account gate.
  // Exact match on the lowercased email (ilike would treat % and _ as
  // wildcards); member emails are stored lowercased at write time.
  const { data: member } = await supabase
    .from("members")
    .select("id, status")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (!member) {
    return res
      .status(400)
      .json({ ok: false, error: "No member record with that email — add the member first." });
  }

  const origin =
    (req.headers["x-forwarded-proto"] || "https") +
    "://" +
    (req.headers["x-forwarded-host"] || req.headers.host || "seqdvgc.com.au");
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/member/welcome`,
  });
  if (inviteError) {
    const msg = `${inviteError.message || ""}`;
    if (msg.toLowerCase().includes("already")) {
      return res.status(200).json({ ok: true, alreadyInvited: true });
    }
    console.error("Invite failed", inviteError);
    return res.status(502).json({ ok: false, error: "Couldn't send the invite. Try again." });
  }
  return res.status(200).json({ ok: true });
}
