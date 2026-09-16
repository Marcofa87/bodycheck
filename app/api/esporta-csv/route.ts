import { format } from "date-fns";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";

import { LOCALE_INFO } from "@/i18n/config";
import { CAMPI } from "@/lib/misurazioni/fields";
import { creaFormatter } from "@/lib/misurazioni/format";
import { createClient } from "@/lib/supabase/server";

/** Escape di un valore per CSV con il separatore di campo indicato. */
function cella(valore: string | null, separatore: string): string {
  if (valore === null || valore === undefined) return "";
  if (valore.includes(separatore) || /["\n\r]/.test(valore)) {
    return `"${valore.replace(/"/g, '""')}"`;
  }
  return valore;
}

export async function GET() {
  await connection();
  const t = await getTranslations();

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return new Response(t("csv.nonAutorizzato"), { status: 401 });

    const { data, error } = await supabase
      .from("misurazioni")
      .select("*")
      .eq("user_id", user.id)
      .order("data_misurazione", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Separatore di campo e decimale seguono la lingua, così Excel apre il file correttamente.
    const locale = await getLocale();
    const { separatoreCsv } = LOCALE_INFO[locale];
    const formatter = creaFormatter(locale);
    const numero = (v: number | null) => (v === null ? null : formatter.perInput(v));

    const intestazione = [
      t("csv.data"),
      ...CAMPI.map((c) => `${t(`campi.${c.key}.label`)} (${c.unita})`),
      t("csv.note"),
    ];
    const righe = (data ?? []).map((m) => [
      m.data_misurazione,
      ...CAMPI.map((c) => cella(numero(m[c.key]), separatoreCsv)),
      cella(m.note, separatoreCsv),
    ]);

    const csv = [intestazione, ...righe].map((r) => r.join(separatoreCsv)).join("\r\n");
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
    return new Response(t("csv.fallita"), { status: 500 });
  }
}
