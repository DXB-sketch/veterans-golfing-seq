import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Presence-only sanity log (never values): the payment form silently falls
  // back to "coming soon" when the VITE_SQUARE_* vars are missing at build
  // time, so make each build say whether it can see them.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  for (const name of ["VITE_SQUARE_APP_ID", "VITE_SQUARE_LOCATION_ID", "VITE_SUPABASE_URL"]) {
    console.log(`[env check] ${name}: ${env[name] ? "present" : "MISSING"}`);
  }
  return {
    plugins: [react()],
  };
});
