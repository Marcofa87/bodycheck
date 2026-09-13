"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { misurazioneSchema, type MisurazioneFormInput } from "@/lib/misurazioni/schema";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

const uuidSchema = z.uuid("Identificativo non valido");

/**
 * Crea (id assente) o aggiorna (id presente) una misurazione.
 * I dati arrivano come stringhe dal form e vengono ri-validati qui lato server.
 */
export async function salvaMisurazione(
  input: MisurazioneFormInput,
  id?: string | null,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = misurazioneSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Controlla i campi evidenziati.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  if (id) {
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return { ok: false, error: "Misurazione non trovata." };
  }

  try {
    const supabase = await createClient();

    if (id) {
      const { error, data } = await supabase
        .from("misurazioni")
        .update(parsed.data)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) return { ok: false, error: "Misurazione non trovata o non modificabile." };
    } else {
      const { error } = await supabase
        .from("misurazioni")
        .insert({ ...parsed.data, user_id: user.id });

      if (error) throw error;
    }
  } catch (err) {
    console.error("[salvaMisurazione]", err);
    return { ok: false, error: "Salvataggio non riuscito. Riprova tra qualche istante." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function eliminaMisurazione(id: string): Promise<ActionResult> {
  const user = await requireUser();

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "Misurazione non trovata." };

  try {
    const supabase = await createClient();
    const { error, data } = await supabase
      .from("misurazioni")
      .delete()
      .eq("id", idParsed.data)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, error: "Misurazione non trovata o già eliminata." };
  } catch (err) {
    console.error("[eliminaMisurazione]", err);
    return { ok: false, error: "Eliminazione non riuscita. Riprova tra qualche istante." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
