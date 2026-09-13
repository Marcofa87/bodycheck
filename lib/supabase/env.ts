const PLACEHOLDER_PATTERN = /TUO|TUA|INSERISCI|xxx/i;

/**
 * Restituisce true solo se entrambe le variabili Supabase sono presenti
 * e non contengono più i placeholder di `.env.local`.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  if (PLACEHOLDER_PATTERN.test(url) || PLACEHOLDER_PATTERN.test(anonKey)) return false;
  return true;
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase non è configurato: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local e riavvia il server di sviluppo.",
    );
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}
