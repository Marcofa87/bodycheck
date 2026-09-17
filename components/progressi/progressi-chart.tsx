"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CAMPI,
  CAMPI_PER_SEZIONE,
  METRICA_DERIVATA_VITA_FIANCHI,
  SEZIONI,
  getCampo,
  type MetricaGrafico,
} from "@/lib/misurazioni/fields";
import { useFormatMisurazioni } from "@/lib/misurazioni/format";
import { riepilogoSerie, serieMetrica } from "@/lib/misurazioni/stats";
import type { Misurazione } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Periodo = "7" | "30" | "90" | "365" | "tutto";
const PERIODI: Periodo[] = ["7", "30", "90", "365", "tutto"];

const NESSUNA = "nessuna";
type Confronto = MetricaGrafico | typeof NESSUNA;

interface InfoMetrica {
  label: string;
  unita: string;
  decimali: 1 | 2;
}

interface ProgressiChartProps {
  misurazioni: Misurazione[];
}

export function ProgressiChart({ misurazioni }: ProgressiChartProps) {
  const t = useTranslations();
  const formatter = useFormatMisurazioni();
  const [metrica, setMetrica] = useState<MetricaGrafico>("peso_kg");
  const [confronto, setConfronto] = useState<Confronto>(NESSUNA);
  const [periodo, setPeriodo] = useState<Periodo>("90");

  const giorni = periodo === "tutto" ? null : Number(periodo);

  const etichettaPeriodo = (p: Periodo) =>
    p === "tutto"
      ? t("progressi.tutto")
      : p === "365"
        ? t("progressi.unAnno")
        : t("comune.giorni", { giorni: Number(p) });

  const infoMetrica = (m: MetricaGrafico): InfoMetrica => {
    if (m === METRICA_DERIVATA_VITA_FIANCHI) {
      return {
        label: t("progressi.rapportoVitaFianchi"),
        unita: "",
        decimali: 2,
      };
    }
    const campo = getCampo(m);
    return { label: t(`campi.${m}.label`), unita: campo.unita, decimali: 1 };
  };

  // Mappa valore → etichetta usata da <SelectValue> per mostrare il testo selezionato.
  const itemsMetriche = useMemo<Record<string, string>>(
    () => ({
      ...Object.fromEntries(
        CAMPI.map((c) => [c.key, t(`campi.${c.key}.label`)]),
      ),
      [METRICA_DERIVATA_VITA_FIANCHI]: t(
        "progressi.rapportoVitaFianchiCalcolato",
      ),
    }),
    [t],
  );
  const itemsConfronto = useMemo<Record<string, string>>(
    () => ({ [NESSUNA]: t("progressi.nessunConfronto"), ...itemsMetriche }),
    [t, itemsMetriche],
  );

  const seriePrincipale = useMemo(
    () => serieMetrica(misurazioni, metrica, giorni),
    [misurazioni, metrica, giorni],
  );
  const serieConfronto = useMemo(
    () =>
      confronto === NESSUNA ? [] : serieMetrica(misurazioni, confronto, giorni),
    [misurazioni, confronto, giorni],
  );

  const riepilogo = useMemo(
    () => riepilogoSerie(seriePrincipale),
    [seriePrincipale],
  );
  const info = infoMetrica(metrica);
  const infoConfronto = confronto === NESSUNA ? null : infoMetrica(confronto);

  // Unione delle due serie sulla stessa asse temporale.
  const dati = useMemo(() => {
    const perData = new Map<string, { data: string; a?: number; b?: number }>();
    for (const p of seriePrincipale)
      perData.set(p.data, { data: p.data, a: p.valore });
    for (const p of serieConfronto) {
      const riga = perData.get(p.data) ?? { data: p.data };
      riga.b = p.valore;
      perData.set(p.data, riga);
    }
    return Array.from(perData.values()).sort((x, y) =>
      x.data.localeCompare(y.data),
    );
  }, [seriePrincipale, serieConfronto]);

  return (
    <div className="space-y-4">
      {/* Controlli */}
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="metrica">{t("progressi.metrica")}</Label>
            <Select
              items={itemsMetriche}
              value={metrica}
              onValueChange={(v) => v && setMetrica(v as MetricaGrafico)}
            >
              <SelectTrigger id="metrica" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <OpzioniMetriche />
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confronto">{t("progressi.confrontaCon")}</Label>
            <Select
              items={itemsConfronto}
              value={confronto}
              onValueChange={(v) => v && setConfronto(v as Confronto)}
            >
              <SelectTrigger id="confronto" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NESSUNA}>
                  {t("progressi.nessunConfronto")}
                </SelectItem>
                <SelectSeparator />
                <OpzioniMetriche escludi={metrica} />
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>{t("progressi.periodo")}</Label>
            <Tabs
              value={periodo}
              onValueChange={(v) => setPeriodo(v as Periodo)}
            >
              <TabsList className="w-full lg:w-auto">
                {PERIODI.map((p) => (
                  <TabsTrigger key={p} value={p}>
                    {etichettaPeriodo(p)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Riepilogo statistico */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatMini
          label={t("progressi.variazioneNelPeriodo")}
          valore={
            riepilogo
              ? formatter.numero(riepilogo.variazione, info.decimali)
              : null
          }
          unita={info.unita}
          trend={riepilogo ? Math.sign(riepilogo.variazione) : 0}
          sottotitolo={
            riepilogo
              ? `${formatter.data(riepilogo.primo.data)} → ${formatter.data(riepilogo.ultimo.data)}`
              : undefined
          }
        />
        <StatMini
          label={t("progressi.media")}
          valore={
            riepilogo ? formatter.numero(riepilogo.media, info.decimali) : null
          }
          unita={info.unita}
          sottotitolo={
            riepilogo
              ? t("comune.misurazioni", { count: riepilogo.conteggio })
              : undefined
          }
        />
        <StatMini
          label={t("progressi.minimo")}
          valore={
            riepilogo ? formatter.numero(riepilogo.minimo, info.decimali) : null
          }
          unita={info.unita}
        />
        <StatMini
          label={t("progressi.massimo")}
          valore={
            riepilogo
              ? formatter.numero(riepilogo.massimo, info.decimali)
              : null
          }
          unita={info.unita}
        />
      </div>

      {/* Grafico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{info.label}</CardTitle>
          <CardDescription>
            {seriePrincipale.length === 0
              ? t("progressi.nessunDatoPeriodo")
              : infoConfronto
                ? t("progressi.confrontoCon", {
                    metrica: infoConfronto.label.toLowerCase(),
                  })
                : periodo === "tutto"
                  ? t("progressi.andamentoTutto")
                  : t("progressi.andamentoPeriodo", {
                      periodo: etichettaPeriodo(periodo),
                    })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full sm:h-80">
            {seriePrincipale.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                {t("progressi.registraPerGrafico")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dati}
                  margin={{
                    top: 8,
                    right: infoConfronto ? 8 : 16,
                    bottom: 0,
                    left: -8,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(v: string) =>
                      formatter.data(
                        v,
                        giorni !== null && giorni <= 90 ? "d MMM" : "MMM yy",
                      )
                    }
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    yAxisId="sinistra"
                    domain={["auto", "auto"]}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      formatter.numero(v, info.decimali)
                    }
                    width={48}
                  />
                  {infoConfronto && (
                    <YAxis
                      yAxisId="destra"
                      orientation="right"
                      domain={["auto", "auto"]}
                      tick={{
                        fontSize: 11,
                        fill: "var(--color-muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        formatter.numero(v, infoConfronto.decimali)
                      }
                      width={48}
                    />
                  )}
                  <Tooltip
                    cursor={{ stroke: "var(--color-border)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const riga = payload[0].payload as {
                        data: string;
                        a?: number;
                        b?: number;
                      };
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                          <p className="mb-1 text-muted-foreground">
                            {formatter.dataLunga(String(label ?? riga.data))}
                          </p>
                          {riga.a !== undefined && (
                            <p className="flex items-center gap-1.5 font-medium tabular-nums">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: "var(--color-chart-1)" }}
                              />
                              {info.label}:{" "}
                              {formatter.numero(riga.a, info.decimali)}{" "}
                              {info.unita}
                            </p>
                          )}
                          {infoConfronto && riga.b !== undefined && (
                            <p className="flex items-center gap-1.5 font-medium tabular-nums">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: "var(--color-chart-2)" }}
                              />
                              {infoConfronto.label}:{" "}
                              {formatter.numero(riga.b, infoConfronto.decimali)}{" "}
                              {infoConfronto.unita}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  {infoConfronto && (
                    <Legend
                      verticalAlign="top"
                      height={28}
                      iconType="circle"
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">
                          {value}
                        </span>
                      )}
                    />
                  )}
                  <Line
                    yAxisId="sinistra"
                    type="monotone"
                    dataKey="a"
                    name={info.label}
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={
                      dati.length <= 20
                        ? { r: 3, strokeWidth: 0, fill: "var(--color-chart-1)" }
                        : false
                    }
                    activeDot={{ r: 5 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                  {infoConfronto && (
                    <Line
                      yAxisId="destra"
                      type="monotone"
                      dataKey="b"
                      name={infoConfronto.label}
                      stroke="var(--color-chart-2)"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={
                        dati.length <= 20
                          ? {
                              r: 3,
                              strokeWidth: 0,
                              fill: "var(--color-chart-2)",
                            }
                          : false
                      }
                      activeDot={{ r: 5 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Voci del select raggruppate per sezione, più la metrica derivata. */
function OpzioniMetriche({ escludi }: { escludi?: MetricaGrafico }) {
  const t = useTranslations();
  return (
    <>
      {SEZIONI.map((id) => (
        <SelectGroup key={id}>
          <SelectLabel>{t(`sezioni.${id}.label`)}</SelectLabel>
          {CAMPI_PER_SEZIONE[id]
            .filter((c) => c.key !== escludi)
            .map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {t(`campi.${c.key}.label`)}
              </SelectItem>
            ))}
        </SelectGroup>
      ))}
      {escludi !== METRICA_DERIVATA_VITA_FIANCHI && (
        <SelectGroup>
          <SelectLabel>{t("progressi.calcolate")}</SelectLabel>
          <SelectItem value={METRICA_DERIVATA_VITA_FIANCHI}>
            {t("progressi.rapportoVitaFianchi")}
          </SelectItem>
        </SelectGroup>
      )}
    </>
  );
}

function StatMini({
  label,
  valore,
  unita,
  trend,
  sottotitolo,
}: {
  label: string;
  valore: string | null;
  unita: string;
  trend?: number;
  sottotitolo?: string;
}) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1">
          {trend !== undefined && valore !== null && (
            <span
              className={cn(
                "self-center",
                trend > 0
                  ? "text-negative"
                  : trend < 0
                    ? "text-positive"
                    : "text-muted-foreground",
              )}
            >
              {trend > 0 ? (
                <ArrowUpRightIcon className="size-4" />
              ) : trend < 0 ? (
                <ArrowDownRightIcon className="size-4" />
              ) : (
                <MinusIcon className="size-4" />
              )}
            </span>
          )}
          <span className="text-xl font-semibold tabular-nums">
            {valore ?? "—"}
          </span>
          {valore !== null && unita && (
            <span className="text-xs text-muted-foreground">{unita}</span>
          )}
        </div>
        {sottotitolo && (
          <p className="truncate text-[11px] text-muted-foreground">
            {sottotitolo}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
