import { supabase } from "./supabase.js";

// Talk to the admin-users Edge Function, which manages committee accounts
// server-side. It only accepts requests from a signed-in admin.
async function call(body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "failed");
  return json;
}

export const listTeam = () => call({ action: "list" });
export const createTeamMember = (email, password) =>
  call({ action: "create", email, password });
export const removeTeamMember = (id) => call({ action: "remove", id });

// Plain-English messages for every way the function can say no.
export function teamErrorMessage(code) {
  switch (code) {
    case "email_exists":
      return "There's already an account with that email address.";
    case "weak_password":
      return "The password needs to be at least 8 characters long.";
    case "bad_email":
      return "That doesn't look like an email address. Please check it and try again.";
    case "cannot_remove_self":
      return "You can't remove your own account. Ask another committee member to do it.";
    case "last_account":
      return "You can't remove the last account. There'd be no one left who can sign in.";
    default:
      return "Something went wrong. Please check your internet connection and try again.";
  }
}
