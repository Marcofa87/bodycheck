import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import type { AuthState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

/** Box inline di errore/successo restituito dalle action di autenticazione. Nasconde lo stato `idle`. */
export function MessaggioStato({ state }: { state: AuthState }) {
  if (state.status === "idle") return null;

  const errore = state.status === "error";

  return (
    <div
      role={errore ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        errore
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary",
      )}
    >
      {errore ? (
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{state.message}</span>
    </div>
  );
}
