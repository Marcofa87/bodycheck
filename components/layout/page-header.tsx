import type { ReactNode } from "react";

interface PageHeaderProps {
  titolo: string;
  descrizione?: string;
  azioni?: ReactNode;
}

export function PageHeader({ titolo, descrizione, azioni }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titolo}</h1>
        {descrizione && <p className="mt-1 text-sm text-muted-foreground">{descrizione}</p>}
      </div>
      {azioni && <div className="flex shrink-0 items-center gap-2">{azioni}</div>}
    </div>
  );
}
