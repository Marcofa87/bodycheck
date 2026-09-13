import { DatabaseIcon, KeyRoundIcon, RefreshCwIcon, TerminalIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const passi = [
  {
    icon: DatabaseIcon,
    titolo: "Crea il progetto Supabase",
    testo: "Vai su supabase.com, crea un nuovo progetto e attendi che il database sia pronto.",
  },
  {
    icon: TerminalIcon,
    titolo: "Esegui lo schema SQL",
    testo: "Nel SQL Editor incolla ed esegui il contenuto di supabase/schema.sql (tabella, RLS e indici).",
  },
  {
    icon: KeyRoundIcon,
    titolo: "Copia le chiavi in .env.local",
    testo: "Da Project Settings → API copia Project URL e anon public key e sostituisci i placeholder.",
  },
  {
    icon: RefreshCwIcon,
    titolo: "Riavvia il server",
    testo: "Ferma e riavvia `pnpm dev`: le variabili d'ambiente vengono lette all'avvio.",
  },
];

/** Mostrata al posto dell'app finché le variabili Supabase non sono impostate. */
export function ConfigurazioneMancante() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-xl">Configura Supabase per iniziare</CardTitle>
          <CardDescription>
            BodyTrack non trova le credenziali del progetto Supabase. Completa questi passaggi:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="space-y-4">
            {passi.map((passo, i) => (
              <li key={passo.titolo} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <passo.icon className="size-4" />
                </span>
                <div>
                  <p className="font-medium">
                    {i + 1}. {passo.titolo}
                  </p>
                  <p className="text-sm text-muted-foreground">{passo.testo}</p>
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
