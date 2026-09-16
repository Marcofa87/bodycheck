import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { ConfigurazioneMancante } from "@/components/setup/configurazione-mancante";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Accedi" };

const MESSAGGI_ERRORE: Record<string, string> = {
  "link-non-valido":
    "Il link non è valido o è scaduto. Prova ad accedere, registrati di nuovo oppure richiedi un nuovo link con “Password dimenticata?”.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { errore } = await searchParams;
  if (!isSupabaseConfigured()) return <ConfigurazioneMancante />;

  const codiceErrore = Array.isArray(errore) ? errore[0] : errore;
  const messaggioIniziale = codiceErrore ? MESSAGGI_ERRORE[codiceErrore] : undefined;

  return (
    <AuthPageShell>
      <LoginForm messaggioIniziale={messaggioIniziale} />
    </AuthPageShell>
  );
}
