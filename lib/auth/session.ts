import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Data Access Layer per la sessione.
 *
 * `proxy.ts` fa un controllo ottimistico, ma ogni Server Component / Server Action
 * che tocca dati deve verificare l'utente qui: se la sessione è scaduta o assente
 * si viene reindirizzati al login.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return data.user;
});

/** Variante che non reindirizza: utile per la pagina di login e la root. */
export const getOptionalUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});
