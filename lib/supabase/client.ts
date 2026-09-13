import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";
import type { Database } from "./types";

/** Client Supabase da usare nei Client Components ("use client"). */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
