import { ScaleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { NuovaMisurazioneButton } from "@/components/misurazioni/nuova-misurazione-button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  titolo?: string;
  descrizione?: string;
  mostraBottone?: boolean;
}

export function EmptyState({ titolo, descrizione, mostraBottone = true }: EmptyStateProps) {
  const t = useTranslations();

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScaleIcon className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{titolo ?? t("emptyState.titolo")}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {descrizione ?? t("emptyState.descrizione")}
          </p>
        </div>
        {mostraBottone && <NuovaMisurazioneButton size="lg" testo={t("nav.aggiungiMisurazione")} />}
      </CardContent>
    </Card>
  );
}
