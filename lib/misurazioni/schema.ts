import { format, isValid, parseISO } from "date-fns";
import type { useTranslations } from "next-intl";
import { z } from "zod";

import type { Locale } from "@/i18n/config";
import type { Misurazione } from "@/lib/supabase/types";

import { CAMPI, getCampo, type CampoMetrica } from "./fields";
import { creaFormatter } from "./format";

/** Funzione di traduzione sul namespace radice (`useTranslations()` / `getTranslations()`). */
export type Traduttore = ReturnType<typeof useTranslations<never>>;

/** Accetta sia la virgola che il punto come separatore decimale. */
export function parseNumero(value: string): number {
  return Number(value.trim().replace(",", "."));
}

export const oggiISO = () => format(new Date(), "yyyy-MM-dd");

const arrotonda = (n: number) => Math.round(n * 100) / 100;

/**
 * Costruisce lo schema di validazione con i messaggi nella lingua corrente.
 * Usato sia dal form (client) sia dalla Server Action, così i messaggi coincidono.
 */
export function creaMisurazioneSchema(t: Traduttore) {
  function validaNumero(
    campo: CampoMetrica,
    value: string,
    ctx: z.RefinementCtx,
  ) {
    const n = parseNumero(value);
    if (Number.isNaN(n)) {
      ctx.addIssue({
        code: "custom",
        message: t("validazione.numeroNonValido"),
      });
      return;
    }
    if (n <= 0) {
      ctx.addIssue({ code: "custom", message: t("validazione.positivo") });
      return;
    }
    if (n < campo.min || n > campo.max) {
      ctx.addIssue({
        code: "custom",
        message: t("validazione.range", {
          min: campo.min,
          max: campo.max,
          unita: campo.unita,
        }),
      });
    }
  }

  /** Campo numerico opzionale: stringa vuota → null. */
  function campoOpzionale(campo: CampoMetrica) {
    return z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === "") return;
        validaNumero(campo, value, ctx);
      })
      .transform((value) =>
        value === "" ? null : arrotonda(parseNumero(value)),
      );
  }

  /** Campo numerico obbligatorio. */
  function campoObbligatorio(campo: CampoMetrica) {
    return z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (value === "") {
          ctx.addIssue({
            code: "custom",
            message: t("validazione.obbligatorio", {
              campo: t(`campi.${campo.key}.label`),
            }),
          });
          return;
        }
        validaNumero(campo, value, ctx);
      })
      .transform((value) => arrotonda(parseNumero(value)));
  }

  return z.object({
    data_misurazione: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("validazione.dataNonValida"))
      .refine((v) => isValid(parseISO(v)), t("validazione.dataNonValida"))
      .refine((v) => v <= oggiISO(), t("validazione.dataFutura")),

    peso_kg: campoObbligatorio(getCampo("peso_kg")),
    massa_grassa_kg: campoObbligatorio(getCampo("massa_grassa_kg")),
    massa_magra_kg: campoObbligatorio(getCampo("massa_magra_kg")),
    grasso_corporeo_percentuale: campoOpzionale(
      getCampo("grasso_corporeo_percentuale"),
    ),
    collo_cm: campoOpzionale(getCampo("collo_cm")),
    torace_superiore_cm: campoOpzionale(getCampo("torace_superiore_cm")),
    petto_cm: campoOpzionale(getCampo("petto_cm")),
    vita_cm: campoOpzionale(getCampo("vita_cm")),

    braccio_sinistro_cm: campoOpzionale(getCampo("braccio_sinistro_cm")),
    braccio_destro_cm: campoOpzionale(getCampo("braccio_destro_cm")),

    fianchi_cm: campoOpzionale(getCampo("fianchi_cm")),
    vita_fianchi_cm: campoOpzionale(getCampo("vita_fianchi_cm")),
    coscia_superiore_sinistra_cm: campoOpzionale(
      getCampo("coscia_superiore_sinistra_cm"),
    ),
    coscia_superiore_destra_cm: campoOpzionale(
      getCampo("coscia_superiore_destra_cm"),
    ),
    coscia_inferiore_sinistra_cm: campoOpzionale(
      getCampo("coscia_inferiore_sinistra_cm"),
    ),
    coscia_inferiore_destra_cm: campoOpzionale(
      getCampo("coscia_inferiore_destra_cm"),
    ),
    polpaccio_sinistro_cm: campoOpzionale(getCampo("polpaccio_sinistro_cm")),
    polpaccio_destro_cm: campoOpzionale(getCampo("polpaccio_destro_cm")),

    note: z
      .string()
      .trim()
      .max(1000, t("validazione.noteMax"))
      .transform((v) => (v === "" ? null : v)),
  });
}

export type MisurazioneSchema = ReturnType<typeof creaMisurazioneSchema>;
/** Valori così come stanno nel form (tutte stringhe). */
export type MisurazioneFormInput = z.input<MisurazioneSchema>;
/** Valori validati e convertiti, pronti per il DB. */
export type MisurazioneFormOutput = z.output<MisurazioneSchema>;

export function formInputVuoto(): MisurazioneFormInput {
  const base = Object.fromEntries(CAMPI.map((c) => [c.key, ""])) as Record<
    CampoMetrica["key"],
    string
  >;
  return { ...base, data_misurazione: oggiISO(), note: "" };
}

/** Converte una riga del DB nei valori (stringhe) del form, per la modifica, con il separatore decimale della lingua. */
export function misurazioneToFormInput(
  m: Misurazione,
  locale: Locale,
): MisurazioneFormInput {
  const formatter = creaFormatter(locale);
  const base = Object.fromEntries(
    CAMPI.map((c) => {
      const valore = m[c.key];
      return [c.key, valore === null ? "" : formatter.perInput(valore)];
    }),
  ) as Record<CampoMetrica["key"], string>;
  return { ...base, data_misurazione: m.data_misurazione, note: m.note ?? "" };
}
