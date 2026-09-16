"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormatMisurazioni } from "@/lib/misurazioni/format";
import type { PuntoSerie } from "@/lib/misurazioni/stats";

interface WeightSparklineProps {
  /** Serie completa del peso, ordinata per data crescente. */
  serie: PuntoSerie[];
}

type Periodo = "30" | "90";

export function WeightSparkline({ serie }: WeightSparklineProps) {
  const t = useTranslations();
  const formatter = useFormatMisurazioni();
  const [periodo, setPeriodo] = useState<Periodo>("30");

  const dati = useMemo(() => {
    const giorni = Number(periodo);
    const oggi = new Date();
    return serie.filter((p) => differenceInCalendarDays(oggi, parseISO(p.data)) <= giorni);
  }, [serie, periodo]);

  const variazione =
    dati.length >= 2 ? dati[dati.length - 1].valore - dati[0].valore : null;

  const [minY, maxY] = useMemo(() => {
    if (dati.length === 0) return [0, 0];
    const valori = dati.map((d) => d.valore);
    const min = Math.min(...valori);
    const max = Math.max(...valori);
    const margine = Math.max(0.5, (max - min) * 0.2);
    return [Math.floor(min - margine), Math.ceil(max + margine)];
  }, [dati]);

  const giorni = Number(periodo);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("dashboard.andamentoPeso")}
          </CardTitle>
          <CardDescription>
            {dati.length === 0
              ? t("dashboard.nessunaNelPeriodo", { giorni })
              : variazione === null
                ? t("dashboard.unaNelPeriodo", { count: dati.length })
                : t("dashboard.variazioneNelPeriodo", {
                    variazione: formatter.variazione(variazione, "kg"),
                    giorni,
                    count: dati.length,
                  })}
          </CardDescription>
        </div>
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
          <TabsList>
            <TabsTrigger value="30">{t("comune.giorni", { giorni: 30 })}</TabsTrigger>
            <TabsTrigger value="90">{t("comune.giorni", { giorni: 90 })}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-36 w-full">
          {dati.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              {t("dashboard.aggiungiPerGrafico")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dati} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="data" hide />
                <YAxis domain={[minY, maxY]} hide />
                <Tooltip
                  cursor={{ stroke: "var(--color-border)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const punto = payload[0].payload as PuntoSerie;
                    return (
                      <div className="rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                        <p className="text-muted-foreground">{formatter.data(punto.data, "d MMMM yyyy")}</p>
                        <p className="font-semibold tabular-nums">{formatter.valore(punto.valore, "kg")}</p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="valore"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#sparkline-fill)"
                  dot={dati.length <= 12}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
