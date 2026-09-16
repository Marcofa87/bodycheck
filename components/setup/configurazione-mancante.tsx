import { DatabaseIcon, KeyRoundIcon, RefreshCwIcon, TerminalIcon, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSelect } from "@/components/layout/language-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PASSI: { chiave: "progetto" | "schema" | "chiavi" | "riavvia"; icon: LucideIcon }[] = [
  { chiave: "progetto", icon: DatabaseIcon },
  { chiave: "schema", icon: TerminalIcon },
  { chiave: "chiavi", icon: KeyRoundIcon },
  { chiave: "riavvia", icon: RefreshCwIcon },
];

/** Mostrata al posto dell'app finché le variabili Supabase non sono impostate. */
export function ConfigurazioneMancante() {
  const t = useTranslations("setup");

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl">{t("titolo")}</CardTitle>
            <LanguageSelect esteso className="-mt-1 -mr-1" />
          </div>
          <CardDescription>{t("descrizione")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="space-y-4">
            {PASSI.map((passo, i) => (
              <li key={passo.chiave} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <passo.icon className="size-4" />
                </span>
                <div>
                  <p className="font-medium">
                    {i + 1}. {t(`passi.${passo.chiave}.titolo`)}
                  </p>
                  <p className="text-sm text-muted-foreground">{t(`passi.${passo.chiave}.testo`)}</p>
                </div>
              </li>
            ))}
          </ol>

          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
            <code>{`# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}</code>
          </pre>
        </CardContent>
      </Card>
    </main>
  );
}
