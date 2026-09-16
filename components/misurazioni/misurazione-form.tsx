"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SaveIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { salvaMisurazione } from "@/lib/actions/misurazioni";
import {
  CAMPI_PER_SEZIONE,
  SEZIONI,
  type CampoMetrica,
  type SezioneId,
} from "@/lib/misurazioni/fields";
import { useFormatMisurazioni } from "@/lib/misurazioni/format";
import {
  creaMisurazioneSchema,
  formInputVuoto,
  misurazioneToFormInput,
  oggiISO,
  type MisurazioneFormInput,
  type MisurazioneFormOutput,
} from "@/lib/misurazioni/schema";
import type { Misurazione } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface MisurazioneFormProps {
  /** Se presente il form è in modalità modifica. */
  misurazione?: Misurazione | null;
  onSuccess: () => void;
}

const CAMPI_OBBLIGATORI = [
  "peso_kg",
  "massa_grassa_kg",
  "massa_magra_kg",
  "data_misurazione",
  "petto_cm",
  "braccio_sinistro_cm",
  "braccio_destro_cm",
  "fianchi_cm",
];

/** Valore di esempio per il placeholder, in base all'unità. */
const ESEMPI: Record<CampoMetrica["unita"], number> = { "%": 18.5, kg: 72.5, cm: 80 };

export function MisurazioneForm({
  misurazione,
  onSuccess,
}: MisurazioneFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [sezione, setSezione] = useState<SezioneId>("chiave");
  const [isPending, startTransition] = useTransition();

  const schema = useMemo(() => creaMisurazioneSchema(t), [t]);

  const form = useForm<MisurazioneFormInput, unknown, MisurazioneFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: misurazione
      ? misurazioneToFormInput(misurazione, locale)
      : formInputVuoto(),
    mode: "onBlur",
  });

  const { errors } = form.formState;
  const valori = useWatch({ control: form.control });
  // Solo la transition: isSubmitting sarebbe true anche durante la validazione zod
  const occupato = isPending;
  const indiceSezione = SEZIONI.indexOf(sezione);

  const sezioneConErrori = (id: SezioneId) =>
    CAMPI_PER_SEZIONE[id].some((c) => Boolean(errors[c.key]));

  const sezioneCompilata = (id: SezioneId) =>
    CAMPI_PER_SEZIONE[id].some((c) => (valori[c.key] ?? "").trim() !== "");

  const vaiAllaPrimaSezioneConErrori = (
    errs: FieldErrors<MisurazioneFormInput>,
  ) => {
    const target = SEZIONI.find((id) =>
      CAMPI_PER_SEZIONE[id].some((c) => Boolean(errs[c.key])),
    );
    if (target) setSezione(target);
  };

  const onSubmit = () => {
    // Al server inviamo i valori grezzi (stringhe): la validazione viene ripetuta lì.
    const input = form.getValues();
    startTransition(async () => {
      const result = await salvaMisurazione(input, misurazione?.id ?? null);

      if (result.ok) {
        toast.success(misurazione ? t("form.aggiornata") : t("form.salvata"));
        onSuccess();
        return;
      }

      if (result.fieldErrors) {
        for (const [campo, messaggi] of Object.entries(result.fieldErrors)) {
          if (messaggi?.[0]) {
            form.setError(campo as keyof MisurazioneFormInput, {
              message: messaggi[0],
            });
          }
        }
        vaiAllaPrimaSezioneConErrori(form.formState.errors);
      }
      toast.error(result.error);
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, vaiAllaPrimaSezioneConErrori)}
      className="flex h-full flex-col"
      noValidate
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {/* Data */}
        <div className="space-y-1.5">
          <Label htmlFor="data_misurazione">
            {t("form.data")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="data_misurazione"
            type="date"
            max={oggiISO()}
            aria-invalid={Boolean(errors.data_misurazione)}
            disabled={occupato}
            {...form.register("data_misurazione")}
          />
          <ErroreCampo messaggio={errors.data_misurazione?.message} />
        </div>

        {/* Indicatore di avanzamento */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("form.sezioneDi", { n: indiceSezione + 1, totale: SEZIONI.length })}</span>
            <span>{t(`sezioni.${sezione}.label`)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${((indiceSezione + 1) / SEZIONI.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <Tabs value={sezione} onValueChange={(v) => setSezione(v as SezioneId)}>
          <TabsList className="grid w-full grid-cols-3">
            {SEZIONI.map((id, i) => {
              const erroriSezione = sezioneConErrori(id);
              const compilata = sezioneCompilata(id);
              return (
                <TabsTrigger key={id} value={id} className="gap-1.5">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px] font-semibold",
                      erroriSezione
                        ? "bg-destructive text-white"
                        : compilata
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-foreground",
                    )}
                  >
                    {compilata && !erroriSezione ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="hidden sm:inline">{t(`sezioni.${id}.label`)}</span>
                  <span className="sm:hidden">{t(`sezioni.${id}.breve`)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {SEZIONI.map((id) => (
            <TabsContent key={id} value={id} className="pt-3">
              <p className="mb-3 text-xs text-muted-foreground">
                {t(`sezioni.${id}.descrizione`)}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CAMPI_PER_SEZIONE[id].map((campo) => (
                  <CampoNumerico
                    key={campo.key}
                    campo={campo}
                    obbligatorio={CAMPI_OBBLIGATORI.includes(campo.key)}
                    errore={errors[campo.key]?.message}
                    disabled={occupato}
                    registrazione={form.register(campo.key)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note">{t("form.note")}</Label>
          <Textarea
            id="note"
            rows={3}
            placeholder={t("form.notePlaceholder")}
            aria-invalid={Boolean(errors.note)}
            disabled={occupato}
            {...form.register("note")}
          />
          <ErroreCampo messaggio={errors.note?.message} />
        </div>
      </div>

      {/* Footer azioni */}
      <div className="flex items-center justify-between gap-2 border-t bg-background p-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={indiceSezione === 0 || occupato}
            onClick={() => setSezione(SEZIONI[indiceSezione - 1])}
            aria-label={t("form.sezionePrecedente")}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={indiceSezione === SEZIONI.length - 1 || occupato}
            onClick={() => setSezione(SEZIONI[indiceSezione + 1])}
            aria-label={t("form.sezioneSuccessiva")}
          >
            <ChevronRightIcon />
          </Button>
        </div>

        <Button type="submit" disabled={occupato} className="min-w-40">
          {occupato ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          {occupato
            ? t("form.salvataggio")
            : misurazione
              ? t("form.salvaModifiche")
              : t("form.salvaMisurazione")}
        </Button>
      </div>
    </form>
  );
}

interface CampoNumericoProps {
  campo: CampoMetrica;
  obbligatorio?: boolean;
  errore?: string;
  disabled?: boolean;
  registrazione: ReturnType<
    ReturnType<typeof useForm<MisurazioneFormInput>>["register"]
  >;
}

function CampoNumerico({
  campo,
  obbligatorio,
  errore,
  disabled,
  registrazione,
}: CampoNumericoProps) {
  const t = useTranslations();
  const formatter = useFormatMisurazioni();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={campo.key} className="flex items-center justify-between">
        <span>
          {t(`campi.${campo.key}.label`)}{" "}
          {obbligatorio && <span className="text-destructive">*</span>}
        </span>
        <Badge
          variant="secondary"
          className="h-5 px-1.5 text-[10px] font-medium"
        >
          {campo.unita}
        </Badge>
      </Label>
      <Input
        id={campo.key}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={t("form.placeholder", { esempio: formatter.perInput(ESEMPI[campo.unita]) })}
        aria-invalid={Boolean(errore)}
        disabled={disabled}
        {...registrazione}
      />
      <ErroreCampo messaggio={errore} />
    </div>
  );
}

function ErroreCampo({ messaggio }: { messaggio?: string }) {
  if (!messaggio) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {messaggio}
    </p>
  );
}
