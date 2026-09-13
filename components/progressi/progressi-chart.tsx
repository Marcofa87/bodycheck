"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  CAMPI_PER_SEZIONE,
  METRICA_DERIVATA_VITA_FIANCHI,
  SEZIONI,
  getCampo,
  type MetricaGrafico,
} from "@/lib/misurazioni/fields";
import { formatData, formatNumero } from "@/lib/misurazioni/format";
import { riepilogoSerie, serieMetrica } from "@/lib/misurazioni/stats";
import type { Misurazione } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Periodo = "7" | "30" | "90" | "365" | "tutto";
const PERIODI: { value: Periodo; label: string }[] = [
  { value: "7", label: "7 gg" },
  { value: "30", label: "30 gg" },
  { value: "90", label: "90 gg" },
  { value: "365", label: "1 anno" },
  { value: "tutto", label: "Tutto" },
];

const NESSUNA = "nessuna";
type Confronto = MetricaGrafico | typeof NESSUNA;

interface InfoMetrica {
  label: string;
  unita: string;
  decimali: 1 | 2;
}

function infoMetrica(metrica: MetricaGrafico): InfoMetrica {
  if (metrica === METRICA_DERIVATA_VITA_FIANCHI) {
    return { label: "Rapporto vita/fianchi", unita: "", decimali: 2 };
  }
  const campo = getCampo(metrica);
  return { label: campo.label, unita: campo.unita, decimali: 1 };
}

/** Mappa valore → etichetta usata da <SelectValue> per mostrare il testo selezionato. */
const ITEMS_METRICHE: Record<string, string> = {
  ...Object.fromEntries(
    SEZIONI.flatMap((s) => CAMPI_PER_SEZIONE[s.id].map((c) => [c.key, c.label])),
  ),
  [METRICA_DERIVATA_VITA_FIANCHI]: "Rapporto vita/fianchi (calcolato)",
};
const ITEMS_CONFRONTO: Record<string, string> = { [NESSUNA]: "Nessun confronto", ...ITEMS_METRICHE };

interface ProgressiChartProps {
  misurazioni: Misurazione[];
}

export function ProgressiChart({ misurazioni }: ProgressiChartProps) {
  const [metrica, setMetrica] = useState<MetricaGrafico>("peso_kg");
  const [confronto, setConfronto] = useState<Confronto>(NESSUNA);
  const [periodo, setPeriodo] = useState<Periodo>("90");

  const giorni = periodo === "tutto" ? null : Number(periodo);

  const seriePrincipale = useMemo(
    () => serieMetrica(misurazioni, metrica, giorni),
    [misurazioni, metrica, giorni],
  );
  const serieConfronto = useMemo(
    () => (confronto === NESSUNA ? [] : serieMetrica(misurazioni, confronto, giorni)),
    [misurazioni, confronto, giorni],
  );

  const riepilogo = useMemo(() => riepilogoSerie(seriePrincipale), [seriePrincipale]);
  const info = infoMetrica(metrica);
  const infoConfronto = confronto === NESSUNA ? null : infoMetrica(confronto);

  // Unione delle due serie sulla stessa asse temporale.
  const dati = useMemo(() => {
    const perData = new Map<string, { data: string; a?: number; b?: number }>();
    for (const p of seriePrincipale) perData.set(p.data, { data: p.data, a: p.valore });
    for (const p of serieConfronto) {
      const riga = perData.get(p.data) ?? { data: p.data };
      riga.b = p.valore;
      perData.set(p.data, riga);
    }
    return Array.from(perData.values()).sort((x, y) => x.data.localeCompare(y.data));
  }, [seriePrincipale, serieConfronto]);

  return (
    <div className="space-y-4">
      {/* Controlli */}
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="metrica">Metrica</Label>
            <Select
              items={ITEMS_METRICHE}
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
            <Label htmlFor="confronto">Confronta con</Label>
            <Select
              items={ITEMS_CONFRONTO}
              value={confronto}
              onValueChange={(v) => v && setConfronto(v as Confronto)}
            >
              <SelectTrigger id="confronto" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NESSUNA}>Nessun confronto</SelectItem>
                <SelectSeparator />
                <OpzioniMetriche escludi={metrica} />
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>Periodo</Label>
            <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
              <TabsList className="w-full lg:w-auto">
                {PERIODI.map((p) => (
                  <TabsTrigger key={p.value} value={p.value}>
                    {p.label}
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
          label="Variazione nel periodo"
          valore={riepilogo ? formatNumero(riepilogo.variazione, info.decimali) : null}
          unita={info.unita}
          trend={riepilogo ? Math.sign(riepilogo.variazione) : 0}
          sottotitolo={
            riepilogo
              ? `${formatData(riepilogo.primo.data)} → ${formatData(riepilogo.ultimo.data)}`
              : undefined
          }
        />
        <StatMini
          label="Media"
          valore={riepilogo ? formatNumero(riepilogo.media, info.decimali) : null}
          unita={info.unita}
          sottotitolo={riepilogo ? `${riepilogo.conteggio} misurazioni` : undefined}
        />
        <StatMini
          label="Minimo"
          valore={riepilogo ? formatNumero(riepilogo.minimo, info.decimali) : null}
          unita={info.unita}
        />
        <StatMini
          label="Massimo"
          valore={riepilogo ? formatNumero(riepilogo.massimo, info.decimali) : null}
          unita={info.unita}
        />
      </div>

      {/* Grafico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{info.label}</CardTitle>
          <CardDescription>
            {seriePrincipale.length === 0
              ? "Nessun dato per questa metrica nel periodo selezionato."
              : infoConfronto
                ? `Confronto con ${infoConfronto.label.toLowerCase()} (asse destro).`
                : `Andamento ${periodo === "tutto" ? "su tutto lo storico" : `negli ultimi ${PERIODI.find((p) => p.value === periodo)?.label}`}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full sm:h-80">
            {seriePrincipale.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Registra misurazioni con questo valore per vedere il grafico
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dati} margin={{ top: 8, right: infoConfronto ? 8 : 16, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(v: string) => formatData(v, giorni !== null && giorni <= 90 ? "d MMM" : "MMM yy")}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    yAxisId="sinistra"
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatNumero(v, info.decimali)}
                    width={48}
                  />
                  {infoConfronto && (
                    <YAxis
                      yAxisId="destra"
                      orientation="right"
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => formatNumero(v, infoConfronto.decimali)}
                      width={48}
                    />
                  )}
                  <Tooltip
                    cursor={{ stroke: "var(--color-border)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const riga = payload[0].payload as { data: string; a?: number; b?: number };
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                          <p className="mb-1 text-muted-foreground">
                            {formatData(String(label ?? riga.data), "EEEE d MMMM yyyy")}
                          </p>
                          {riga.a !== undefined && (
                            <p className="flex items-center gap-1.5 font-medium tabular-nums">
                              <span className="size-2 rounded-full" style={{ background: "var(--color-chart-1)" }} />
                              {info.label}: {formatNumero(riga.a, info.decimali)} {info.unita}
                            </p>
                          )}
                          {infoConfronto && riga.b !== undefined && (
                            <p className="flex items-center gap-1.5 font-medium tabular-nums">
                              <span className="size-2 rounded-full" style={{ background: "var(--color-chart-2)" }} />
                              {infoConfronto.label}: {formatNumero(riga.b, infoConfronto.decimali)}{" "}
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
                        <span className="text-xs text-muted-foreground">{value}</span>
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
                    dot={dati.length <= 20 ? { r: 3, strokeWidth: 0, fill: "var(--color-chart-1)" } : false}
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
                      dot={dati.length <= 20 ? { r: 3, strokeWidth: 0, fill: "var(--color-chart-2)" } : false}
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
  return (
    <>
      {SEZIONI.map((s) => (
        <SelectGroup key={s.id}>
          <SelectLabel>{s.label}</SelectLabel>
          {CAMPI_PER_SEZIONE[s.id]
            .filter((c) => c.key !== escludi)
            .map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
        </SelectGroup>
      ))}
      {escludi !== METRICA_DERIVATA_VITA_FIANCHI && (
        <SelectGroup>
          <SelectLabel>Calcolate</SelectLabel>
          <SelectItem value={METRICA_DERIVATA_VITA_FIANCHI}>Rapporto vita/fianchi</SelectItem>
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
                trend > 0 ? "text-negative" : trend < 0 ? "text-positive" : "text-muted-foreground",
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
          <span className="text-xl font-semibold tabular-nums">{valore ?? "—"}</span>
          {valore !== null && unita && <span className="text-xs text-muted-foreground">{unita}</span>}
        </div>
        {sottotitolo && <p className="truncate text-[11px] text-muted-foreground">{sottotitolo}</p>}
      </CardContent>
    </Card>
  );
}
