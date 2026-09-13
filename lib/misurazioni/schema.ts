import { format, isValid, parseISO } from "date-fns";
import { z } from "zod";

import type { Misurazione } from "@/lib/supabase/types";

import { CAMPI, getCampo, type CampoMetrica } from "./fields";

/** Accetta sia la virgola che il punto come separatore decimale. */
export function parseNumero(value: string): number {
  return Number(value.trim().replace(",", "."));
}

function validaNumero(campo: CampoMetrica, value: string, ctx: z.RefinementCtx) {
  const n = parseNumero(value);
  if (Number.isNaN(n)) {
    ctx.addIssue({ code: "custom", message: "Inserisci un numero valido" });
    return;
  }
  if (n <= 0) {
    ctx.addIssue({ code: "custom", message: "Il valore deve essere positivo" });
    return;
  }
  if (n < campo.min || n > campo.max) {
    ctx.addIssue({
      code: "custom",
      message: `Valore plausibile tra ${campo.min} e ${campo.max} ${campo.unita}`,
    });
  }
}

const arrotonda = (n: number) => Math.round(n * 100) / 100;

/** Campo numerico opzionale: stringa vuota → null. */
function campoOpzionale(campo: CampoMetrica) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") return;
      validaNumero(campo, value, ctx);
    })
    .transform((value) => (value === "" ? null : arrotonda(parseNumero(value))));
}

/** Campo numerico obbligatorio (solo il peso). */
function campoObbligatorio(campo: CampoMetrica) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") {
        ctx.addIssue({ code: "custom", message: `${campo.label} è obbligatorio` });
        return;
      }
      validaNumero(campo, value, ctx);
    })
    .transform((value) => arrotonda(parseNumero(value)));
}

export const oggiISO = () => format(new Date(), "yyyy-MM-dd");

export const misurazioneSchema = z.object({
  data_misurazione: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Seleziona una data valida")
    .refine((v) => isValid(parseISO(v)), "Seleziona una data valida")
    .refine((v) => v <= oggiISO(), "La data non può essere nel futuro"),

  peso_kg: campoObbligatorio(getCampo("peso_kg")),
  massa_grassa_kg: campoOpzionale(getCampo("massa_grassa_kg")),
  massa_magra_kg: campoOpzionale(getCampo("massa_magra_kg")),
  grasso_corporeo_percentuale: campoOpzionale(getCampo("grasso_corporeo_percentuale")),
  collo_cm: campoOpzionale(getCampo("collo_cm")),
  torace_superiore_cm: campoOpzionale(getCampo("torace_superiore_cm")),
  petto_cm: campoOpzionale(getCampo("petto_cm")),
  vita_cm: campoOpzionale(getCampo("vita_cm")),

  braccio_sinistro_cm: campoOpzionale(getCampo("braccio_sinistro_cm")),
  braccio_destro_cm: campoOpzionale(getCampo("braccio_destro_cm")),

  fianchi_cm: campoOpzionale(getCampo("fianchi_cm")),
  vita_fianchi_cm: campoOpzionale(getCampo("vita_fianchi_cm")),
  coscia_superiore_sinistra_cm: campoOpzionale(getCampo("coscia_superiore_sinistra_cm")),
  coscia_superiore_destra_cm: campoOpzionale(getCampo("coscia_superiore_destra_cm")),
  coscia_inferiore_sinistra_cm: campoOpzionale(getCampo("coscia_inferiore_sinistra_cm")),
  coscia_inferiore_destra_cm: campoOpzionale(getCampo("coscia_inferiore_destra_cm")),
  polpaccio_sinistro_cm: campoOpzionale(getCampo("polpaccio_sinistro_cm")),
  polpaccio_destro_cm: campoOpzionale(getCampo("polpaccio_destro_cm")),

  note: z
    .string()
    .trim()
    .max(1000, "Massimo 1000 caratteri")
    .transform((v) => (v === "" ? null : v)),
});

/** Valori così come stanno nel form (tutte stringhe). */
export type MisurazioneFormInput = z.input<typeof misurazioneSchema>;
/** Valori validati e convertiti, pronti per il DB. */
export type MisurazioneFormOutput = z.output<typeof misurazioneSchema>;

export function formInputVuoto(): MisurazioneFormInput {
  const base = Object.fromEntries(CAMPI.map((c) => [c.key, ""])) as Record<
    CampoMetrica["key"],
    string
  >;
  return { ...base, data_misurazione: oggiISO(), note: "" };
}

/** Converte una riga del DB nei valori (stringhe) del form, per la modifica. */
export function misurazioneToFormInput(m: Misurazione): MisurazioneFormInput {
  const base = Object.fromEntries(
    // Separatore decimale italiano, coerente con placeholder e valori mostrati
    CAMPI.map((c) => [c.key, m[c.key] === null ? "" : String(m[c.key]).replace(".", ",")]),
  ) as Record<CampoMetrica["key"], string>;
  return { ...base, data_misurazione: m.data_misurazione, note: m.note ?? "" };
}
