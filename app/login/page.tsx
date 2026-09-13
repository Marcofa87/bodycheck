import type { Metadata } from "next";
import { ActivityIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { ConfigurazioneMancante } from "@/components/setup/configurazione-mancante";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Accedi" };

const MESSAGGI_ERRORE: Record<string, string> = {
  "link-non-valido": "Il link di conferma non è valido o è scaduto. Prova ad accedere o registrati di nuovo.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { errore } = await searchParams;
  if (!isSupabaseConfigured()) return <ConfigurazioneMancante />;

  const codiceErrore = Array.isArray(errore) ? errore[0] : errore;
  const messaggioIniziale = codiceErrore ? MESSAGGI_ERRORE[codiceErrore] : undefined;

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

      <LoginForm messaggioIniziale={messaggioIniziale} />
    </main>
  );
}
