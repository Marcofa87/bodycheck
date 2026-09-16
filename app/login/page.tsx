import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { ConfigurazioneMancante } from "@/components/setup/configurazione-mancante";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("accedi") };
}

/** Codici passati in `?errore=` da `/auth/callback` e `/reimposta-password`, mappati sulle chiavi di `auth.errori`. */
const CODICI_ERRORE = { "link-non-valido": "linkNonValido" } as const;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { errore } = await searchParams;
  if (!isSupabaseConfigured()) return <ConfigurazioneMancante />;

  const codiceErrore = Array.isArray(errore) ? errore[0] : errore;
  const chiave =
    codiceErrore && codiceErrore in CODICI_ERRORE
      ? CODICI_ERRORE[codiceErrore as keyof typeof CODICI_ERRORE]
      : undefined;

  const t = await getTranslations("auth.errori");
  const messaggioIniziale = chiave ? t(chiave) : undefined;

  return (
    <AuthPageShell>
      <LoginForm messaggioIniziale={messaggioIniziale} />
    </AuthPageShell>
  );
}
