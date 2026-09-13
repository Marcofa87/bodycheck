import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Client Supabase per Server Components, Server Actions e Route Handlers.
 * Va creato per ogni richiesta (legge i cookie della sessione corrente).
 */
export async function createClient() {
  // `cookies()` per primo: segnala a Next che il rendering è per-richiesta (mai statico).
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Da un Server Component non è possibile scrivere cookie: è normale.
          // Il refresh della sessione viene comunque gestito da proxy.ts.
        }
      },
    },
  });
}
