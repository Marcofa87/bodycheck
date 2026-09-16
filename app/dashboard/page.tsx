import type { Metadata } from "next";
import { CalendarDaysIcon, ChevronRightIcon, ListIcon } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { WeightSparkline } from "@/components/dashboard/weight-sparkline";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { creaFormatter } from "@/lib/misurazioni/format";
import { getMisurazioni } from "@/lib/misurazioni/queries";
import { serieMetrica, ultimoValore } from "@/lib/misurazioni/stats";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("dashboard") };
}

export default async function DashboardPage() {
  const [misurazioni, t, locale] = await Promise.all([
    getMisurazioni(),
    getTranslations("dashboard"),
    getLocale(),
  ]);
  const formatter = creaFormatter(locale);

  if (misurazioni.length === 0) {
    return (
      <>
        <PageHeader titolo={t("titolo")} descrizione={t("descrizioneVuota")} />
        <EmptyState />
      </>
    );
  }

  const ultima = misurazioni[0];
  const seriePeso = serieMetrica(misurazioni, "peso_kg", 90);

  return (
    <>
      <PageHeader
        titolo={t("titolo")}
        descrizione={t("descrizione", { data: formatter.dataLunga(ultima.data_misurazione) })}
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
                  <p className="text-xs text-muted-foreground">{t("ultimaMisurazione")}</p>
                  <p className="font-medium">{formatter.data(ultima.data_misurazione, "d MMMM yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ListIcon className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{t("misurazioniTotali")}</p>
                  <p className="font-medium tabular-nums">{misurazioni.length}</p>
                </div>
              </div>
              {ultima.note && (
                <p className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t("note")}</span>
                  {ultima.note}
                </p>
              )}
            </div>

            <Link
              href="/dashboard/storico"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("vediStorico")} <ChevronRightIcon className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
