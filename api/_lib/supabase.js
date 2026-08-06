import { createClient } from "@supabase/supabase-js";

// Service-role client — SERVER ONLY. Returns null when the env isn't
// configured so callers can degrade gracefully (payment still succeeds,
// recording is skipped and logged).
export function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
