# BodyTrack — Monitoraggio peso e composizione corporea

App web per tracciare peso, composizione corporea e circonferenze di un singolo utente autenticato.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth + RLS) · react-hook-form + zod · recharts · date-fns · sonner · lucide-react.

## Funzionalità

- **Autenticazione** email/password (`/login`) con registrazione, conferma email e logout. Le route `/dashboard/**` sono protette da `proxy.ts` (il nuovo nome del middleware in Next 16) e ogni Server Action ri-verifica la sessione.
- **Dashboard** (`/dashboard`): ultimo peso, massa magra, massa grassa e grasso corporeo con variazione ▲/▼ rispetto alla misurazione precedente, sparkline del peso (30/90 giorni), data ultima misurazione, empty state.
- **Storico** (`/dashboard/storico`): tabella paginata, dialog di dettaglio con tutte le circonferenze, modifica (riapre il form precompilato) ed eliminazione con conferma, export CSV.
- **Progressi** (`/dashboard/progressi`): grafico a linee per qualsiasi metrica (incluso il rapporto vita/fianchi calcolato), intervallo 7/30/90/365 giorni o tutto, riepilogo variazione/media/min/max, confronto con una seconda metrica.
- **Form "+ Nuova misurazione"** in un pannello laterale disponibile da ogni pagina, diviso in 3 sezioni (Statistiche chiave · Braccia · Gambe) con indicatore di avanzamento, validazione zod (range plausibili, virgola o punto come decimale) e salvataggio via Server Action con toast.
- Mobile-first (tab bar in basso su smartphone), dark mode, skeleton di caricamento.

## Setup

### 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com), crea un nuovo progetto e attendi che sia pronto.
2. Apri **SQL Editor → New query**, incolla il contenuto di [`supabase/schema.sql`](./supabase/schema.sql) ed esegui. Crea la tabella `misurazioni`, abilita la Row Level Security con le 4 policy (select/insert/update/delete solo sulle proprie righe) e l'indice `(user_id, data_misurazione desc)`.
3. In **Authentication → Providers** assicurati che *Email* sia attivo. In **Authentication → URL Configuration** imposta:
   - *Site URL*: `http://localhost:3000` (in produzione il dominio reale)
   - *Redirect URLs*: aggiungi `http://localhost:3000/auth/callback`

   > Se preferisci non richiedere la conferma email in sviluppo, disattiva *Confirm email* in **Authentication → Providers → Email**.

### 2. Configura le variabili d'ambiente

In **Project Settings → API** copia *Project URL* e *anon public key*, poi in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Finché i placeholder non vengono sostituiti l'app mostra una schermata con questi stessi passaggi.

### 3. Installa e avvia

```bash
pnpm install
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000): verrai reindirizzato a `/login`.

### Altri comandi

```bash
pnpm build          # build di produzione
pnpm start          # avvia la build
pnpm lint           # ESLint
pnpm exec tsc --noEmit   # typecheck
```

## Struttura del progetto

```
proxy.ts                        protezione route + refresh sessione Supabase
supabase/schema.sql             tabella, RLS, indici
app/
  layout.tsx                    font, tema, toaster
  page.tsx                      redirect a /dashboard o /login
  login/page.tsx
  auth/callback/route.ts        scambio codice → sessione (conferma email)
  api/esporta-csv/route.ts      export CSV dello storico
  dashboard/
    layout.tsx                  sidebar / header mobile / Sheet nuova misurazione
    page.tsx · loading.tsx      home riepilogo
    storico/                    tabella paginata
    progressi/                  grafici
components/
  ui/                           shadcn/ui
  auth/                         form di login
  layout/                       sidebar, nav, logout, tema
  misurazioni/                  form 3 sezioni, sheet provider, dialog dettaglio/elimina
  dashboard/ storico/ progressi/
lib/
  supabase/                     client browser · server · proxy · tipi DB · env
  auth/session.ts               requireUser() (DAL)
  misurazioni/                  fields · schema (zod) · stats · format · queries
  actions/                      Server Actions: auth, misurazioni
```

## Tipi del database

`lib/supabase/types.ts` è scritto a mano nel formato della CLI Supabase. Per rigenerarlo:

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > lib/supabase/types.ts
```

## Note

- Il campo `vita_fianchi_cm` è salvato come circonferenza a sé stante, come da specifica; il **rapporto** vita/fianchi viene invece calcolato al volo (`lib/misurazioni/stats.ts`) e mostrato nel dettaglio e nei grafici.
- Le variazioni sono colorate in verde quando "favorevoli" (peso/massa grassa/grasso % in calo, massa magra in aumento) e in rosso nel caso opposto.
- I numeri accettano sia la virgola che il punto come separatore decimale.
