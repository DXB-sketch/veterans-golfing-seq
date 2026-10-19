// Team management for the /admin area.
//
// Public sign-up is disabled on this project, so this function is the only way
// accounts get created: a signed-in committee member can list accounts, create
// one for a new volunteer, or remove one. It runs with the service_role key
// (server-side only) and refuses any request that doesn't carry a valid,
// signed-in user's JWT — the anon key alone is rejected.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // The caller must be a signed-in COMMITTEE user. Invited members are also
  // authenticated, so a session alone is no longer enough.
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const {
    data: { user: caller },
    error: callerError,
  } = await admin.auth.getUser(token);
  if (callerError || !caller) {
    return json({ error: "not_signed_in" }, 401);
  }
  const { data: callerProfile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .maybeSingle();
  if (profileError || callerProfile?.role !== "committee") {
    return json({ error: "not_committee" }, 403);
  }

  async function committeeUserIds(): Promise<string[] | null> {
    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "committee");
    return error ? null : (data ?? []).map((p) => p.id as string);
  }

  let body: { action?: string; email?: string; password?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  if (body.action === "list") {
    // Committee accounts only: paid members also have logins, and they must
    // never show up here with a Remove button next to them.
    const committeeIds = await committeeUserIds();
    if (!committeeIds) return json({ error: "list_failed" }, 500);
    const users = [];
    for (const id of committeeIds) {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (error || !data.user) continue;
      users.push({
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
      });
    }
    users.sort((a, b) => `${a.created_at}`.localeCompare(`${b.created_at}`));
    return json({ users });
  }

  if (body.action === "create") {
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !email.includes("@")) return json({ error: "bad_email" }, 400);
    if (password.length < 8) return json({ error: "weak_password" }, 400);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      const duplicate =
        error.code === "email_exists" || /already/i.test(error.message);
      return json({ error: duplicate ? "email_exists" : "create_failed" }, 400);
    }

    // Accounts made here are committee volunteers. The on-auth-user-created
    // trigger gives every new user a 'member' profile by default, so override
    // it with the service client (bypasses RLS).
    const { error: roleError } = await admin
      .from("profiles")
      .upsert({ id: data.user.id, role: "committee" }, { onConflict: "id" });
    if (roleError) {
      // Don't leave a login that can't reach the admin area.
      await admin.auth.admin.deleteUser(data.user.id);
      return json({ error: "create_failed" }, 500);
    }

    return json({ user: { id: data.user.id, email: data.user.email } });
  }

  if (body.action === "remove") {
    if (!body.id) return json({ error: "bad_request" }, 400);
    if (body.id === caller.id) return json({ error: "cannot_remove_self" }, 400);

    // Only committee accounts can be removed from here, and never the last
    // one — that would lock everyone out.
    const committeeIds = await committeeUserIds();
    if (!committeeIds) return json({ error: "remove_failed" }, 500);
    if (!committeeIds.includes(body.id)) return json({ error: "not_committee_account" }, 400);
    if (committeeIds.length <= 1) return json({ error: "last_account" }, 400);

    const { error } = await admin.auth.admin.deleteUser(body.id);
    if (error) return json({ error: "remove_failed" }, 500);
    return json({ ok: true });
  }

  return json({ error: "bad_request" }, 400);
});
