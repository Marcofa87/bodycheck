import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ReimpostaPasswordForm } from "@/components/auth/reimposta-password-form";
import { ConfigurazioneMancante } from "@/components/setup/configurazione-mancante";
import { getOptionalUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Reimposta password" };

/**
 * Destinazione del link "password dimenticata". Ci si arriva da `/auth/callback`,
 * che ha già creato la sessione di recupero: senza sessione il link è scaduto o manomesso.
 */
export default async function ReimpostaPasswordPage() {
  if (!isSupabaseConfigured()) return <ConfigurazioneMancante />;

  const user = await getOptionalUser();
  if (!user) redirect("/login?errore=link-non-valido");

  return (
    <AuthPageShell>
      <ReimpostaPasswordForm email={user.email} />
    </AuthPageShell>
  );
}
