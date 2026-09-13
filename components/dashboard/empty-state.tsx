import { ScaleIcon } from "lucide-react";

import { NuovaMisurazioneButton } from "@/components/misurazioni/nuova-misurazione-button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  titolo?: string;
  descrizione?: string;
  mostraBottone?: boolean;
}

export function EmptyState({
  titolo = "Inserisci la tua prima misurazione",
  descrizione = "Registra peso e circonferenze per iniziare a seguire i tuoi progressi. Bastano pochi secondi.",
  mostraBottone = true,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScaleIcon className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{titolo}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">{descrizione}</p>
        </div>
        {mostraBottone && <NuovaMisurazioneButton size="lg" testo="Aggiungi misurazione" />}
      </CardContent>
    </Card>
  );
}
