import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampo } from "@/lib/misurazioni/fields";
import { formatData, formatNumero, formatVariazione } from "@/lib/misurazioni/format";
import type { UltimoValore } from "@/lib/misurazioni/stats";
import type { MetricaKey } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface StatCardProps {
  metrica: MetricaKey;
  dato: UltimoValore | null;
  /**
   * Direzione considerata "positiva" (verde). Per il peso e il grasso una
   * diminuzione è mostrata in verde, per la massa magra un aumento.
   */
  direzionePositiva?: "su" | "giu";
}

export function StatCard({ metrica, dato, direzionePositiva = "giu" }: StatCardProps) {
  const campo = getCampo(metrica);

  return (
    <Card className="gap-3">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{campo.label}</CardTitle>
      </CardHeader>
      <CardContent>
        {dato ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatNumero(dato.valore)}
              </span>
              <span className="text-sm text-muted-foreground">{campo.unita}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <Variazione delta={dato.variazione} unita={campo.unita} direzionePositiva={direzionePositiva} />
              <span className="text-muted-foreground">{formatData(dato.data)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-semibold tracking-tight text-muted-foreground/50">—</div>
            <p className="mt-2 text-xs text-muted-foreground">Nessun dato registrato</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Variazione({
  delta,
  unita,
  direzionePositiva,
}: {
  delta: number | null;
  unita: ReturnType<typeof getCampo>["unita"];
  direzionePositiva: "su" | "giu";
}) {
  if (delta === null) {
    return <span className="text-muted-foreground">Prima misurazione</span>;
  }

  const arrotondato = Math.round(delta * 100) / 100;
  if (arrotondato === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
        <MinusIcon className="size-3" /> Stabile
      </span>
    );
  }

  const inAumento = arrotondato > 0;
  const positivo = direzionePositiva === "su" ? inAumento : !inAumento;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
        positivo ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative",
      )}
    >
      {inAumento ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
      {formatVariazione(arrotondato, unita)}
    </span>
  );
}
