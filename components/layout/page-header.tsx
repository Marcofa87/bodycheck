import type { ReactNode } from "react";

import { LanguageSelect } from "./language-select";

interface PageHeaderProps {
  titolo: string;
  descrizione?: string;
  azioni?: ReactNode;
}

export function PageHeader({ titolo, descrizione, azioni }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{titolo}</h1>
        {descrizione && <p className="mt-1 text-sm text-muted-foreground">{descrizione}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {azioni}
        <LanguageSelect esteso />
      </div>
    </div>
  );
}
