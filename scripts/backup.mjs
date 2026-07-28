// Weekly backup: export all tables to timestamped JSON files in /backups.
// Runs in GitHub Actions with the service_role key (server-side only — never
// use this key in the front-end).
import { writeFileSync, mkdirSync } from "node:fs";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const tables = ["events", "membership_enquiries", "contact_messages"];
const stamp = new Date().toISOString().slice(0, 10);
mkdirSync("backups", { recursive: true });

for (const table of tables) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) {
    console.error(`Failed to export ${table}: HTTP ${res.status}`);
    process.exit(1);
  }
  const rows = await res.json();
  const file = `backups/${stamp}-${table}.json`;
  writeFileSync(file, JSON.stringify(rows, null, 2));
  console.log(`${file}: ${rows.length} rows`);
}
