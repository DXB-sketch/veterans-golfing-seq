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

  // The caller must be a signed-in user (all accounts are committee admins).
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const {
    data: { user: caller },
    error: callerError,
  } = await admin.auth.getUser(token);
  if (callerError || !caller) {
    return json({ error: "not_signed_in" }, 401);
  }

  let body: { action?: string; email?: string; password?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  if (body.action === "list") {
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) return json({ error: "list_failed" }, 500);
    return json({
      users: data.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      })),
    });
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
    return json({ user: { id: data.user.id, email: data.user.email } });
  }

  if (body.action === "remove") {
    if (!body.id) return json({ error: "bad_request" }, 400);
    if (body.id === caller.id) return json({ error: "cannot_remove_self" }, 400);

    // Never allow the last account to be removed — that would lock everyone out.
    const { data: all, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) return json({ error: "remove_failed" }, 500);
    if (all.users.length <= 1) return json({ error: "last_account" }, 400);

    const { error } = await admin.auth.admin.deleteUser(body.id);
    if (error) return json({ error: "remove_failed" }, 500);
    return json({ ok: true });
  }

  return json({ error: "bad_request" }, 400);
});
