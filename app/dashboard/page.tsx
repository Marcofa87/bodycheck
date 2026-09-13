import type { Metadata } from "next";
import { CalendarDaysIcon, ChevronRightIcon, ListIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { WeightSparkline } from "@/components/dashboard/weight-sparkline";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatData, formatDataLunga } from "@/lib/misurazioni/format";
import { getMisurazioni } from "@/lib/misurazioni/queries";
import { serieMetrica, ultimoValore } from "@/lib/misurazioni/stats";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const misurazioni = await getMisurazioni();

  if (misurazioni.length === 0) {
    return (
      <>
        <PageHeader titolo="Dashboard" descrizione="Il riepilogo dei tuoi dati corporei." />
        <EmptyState />
      </>
    );
  }

  const ultima = misurazioni[0];
  const seriePeso = serieMetrica(misurazioni, "peso_kg", 90);

  return (
    <>
      <PageHeader
        titolo="Dashboard"
        descrizione={`Ultima misurazione: ${formatDataLunga(ultima.data_misurazione)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard metrica="peso_kg" dato={ultimoValore(misurazioni, "peso_kg")} direzionePositiva="giu" />
        <StatCard metrica="massa_magra_kg" dato={ultimoValore(misurazioni, "massa_magra_kg")} direzionePositiva="su" />
        <StatCard metrica="massa_grassa_kg" dato={ultimoValore(misurazioni, "massa_grassa_kg")} direzionePositiva="giu" />
        <StatCard
          metrica="grasso_corporeo_percentuale"
          dato={ultimoValore(misurazioni, "grasso_corporeo_percentuale")}
          direzionePositiva="giu"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeightSparkline serie={seriePeso} />
        </div>

        <Card>
          <CardContent className="flex h-full flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CalendarDaysIcon className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Ultima misurazione</p>
                  <p className="font-medium">{formatData(ultima.data_misurazione, "d MMMM yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ListIcon className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Misurazioni totali</p>
                  <p className="font-medium tabular-nums">{misurazioni.length}</p>
                </div>
              </div>
              {ultima.note && (
                <p className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Note: </span>
                  {ultima.note}
                </p>
              )}
            </div>

            <Link
              href="/dashboard/storico"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Vedi tutto lo storico <ChevronRightIcon className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
