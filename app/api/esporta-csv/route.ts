import { format } from "date-fns";
import { connection } from "next/server";

import { CAMPI } from "@/lib/misurazioni/fields";
import { createClient } from "@/lib/supabase/server";

/** Escape di un valore per CSV con separatore ";" (formato Excel italiano). */
function cella(valore: string | number | null): string {
  if (valore === null || valore === undefined) return "";
  const testo = typeof valore === "number" ? String(valore).replace(".", ",") : valore;
  if (/[";\n\r]/.test(testo)) return `"${testo.replace(/"/g, '""')}"`;
  return testo;
}

export async function GET() {
  await connection();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return new Response("Non autorizzato", { status: 401 });

    const { data, error } = await supabase
      .from("misurazioni")
      .select("*")
      .eq("user_id", user.id)
      .order("data_misurazione", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    const intestazione = ["Data", ...CAMPI.map((c) => `${c.label} (${c.unita})`), "Note"];
    const righe = (data ?? []).map((m) => [
      m.data_misurazione,
      ...CAMPI.map((c) => cella(m[c.key])),
      cella(m.note),
    ]);

    const csv = [intestazione, ...righe].map((r) => r.join(";")).join("\r\n");
    const nomeFile = `bodytrack-misurazioni-${format(new Date(), "yyyy-MM-dd")}.csv`;

    // BOM iniziale così Excel riconosce l'UTF-8
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomeFile}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[esporta-csv]", err);
    return new Response("Esportazione non riuscita", { status: 500 });
  }
}
