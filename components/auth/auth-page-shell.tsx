import { ActivityIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Contenitore delle pagine di autenticazione (login, reimposta password): logo + card centrata. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <ActivityIcon className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">BodyTrack</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Tieni traccia di peso, composizione corporea e circonferenze.
        </p>
      </div>

      {children}
    </main>
  );
}
