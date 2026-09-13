import "server-only";

import { connection } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Misurazione } from "@/lib/supabase/types";

export const PAGE_SIZE = 10;

/** Tutte le misurazioni dell'utente, dalla più recente alla più vecchia. */
export async function getMisurazioni(): Promise<Misurazione[]> {
  await connection();
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("misurazioni")
    .select("*")
    .eq("user_id", user.id)
    .order("data_misurazione", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getMisurazioni]", error);
    throw new Error("Impossibile caricare le misurazioni.");
  }
  return data ?? [];
}

export interface PaginaMisurazioni {
  righe: Misurazione[];
  totale: number;
  pagina: number;
  pagineTotali: number;
}

export async function getMisurazioniPaginate(pagina: number): Promise<PaginaMisurazioni> {
  await connection();
  const user = await requireUser();
  const supabase = await createClient();

  const paginaSicura = Math.max(1, Math.floor(pagina) || 1);
  const from = (paginaSicura - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("misurazioni")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("data_misurazione", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[getMisurazioniPaginate]", error);
    throw new Error("Impossibile caricare lo storico.");
  }

  const totale = count ?? 0;
  return {
    righe: data ?? [],
    totale,
    pagina: paginaSicura,
    pagineTotali: Math.max(1, Math.ceil(totale / PAGE_SIZE)),
  };
}
