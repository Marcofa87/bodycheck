# Prompt: Sviluppo App "BodyTrack" — Monitoraggio Peso e Composizione Corporea

## Ruolo

Agisci come senior full-stack developer specializzato in **Next.js (App Router), TypeScript, Tailwind CSS e Supabase**. Devi progettare e implementare un'applicazione web completa, production-ready, per il tracciamento del peso e delle misurazioni corporee di un singolo utente autenticato.

Procedi in modo strutturato: prima mostrami l'architettura (struttura cartelle + schema DB), poi genera il codice file per file, partendo dal setup di Supabase e a seguire tutte le pagine e i componenti.

---

## 1. Stack tecnologico obbligatorio

- **Framework**: Next.js 14+ (App Router, Server Components dove sensato, Server Actions per le mutazioni dei dati)
- **Linguaggio**: TypeScript in modalità strict
- **Styling**: Tailwind CSS
- **Componenti UI**: shadcn/ui (Radix + Tailwind) per velocizzare Sheet, Tabs, Table, Card, Dialog, Input, Button, Toast
- **Backend/DB**: Supabase (Postgres + Auth + Row Level Security)
- **Client Supabase**: `@supabase/supabase-js` + `@supabase/ssr` (client browser, client server, middleware)
- **Form**: `react-hook-form` + `zod` per validazione e type-safety
- **Grafici**: `recharts`
- **Icone**: `lucide-react`
- **Date**: `date-fns`
- **Notifiche**: `sonner` per toast di successo/errore

Genera anche i tipi TypeScript della tabella (manualmente o istruzioni per `supabase gen types typescript`).

---

## 2. Autenticazione

- Pagina **`/login`**: form con email + password, toggle tra "Accedi" e "Registrati", gestione errori (credenziali errate, email non confermata, ecc.), stato di loading sul bottone.
- Redirect automatico a `/dashboard` se l'utente è già autenticato; redirect a `/login` se non lo è.
- `middleware.ts` per proteggere tutte le route sotto `/dashboard/**`.
- Bottone di logout visibile nella sidebar/navbar dell'area autenticata.
- Usa Supabase Auth con provider email/password (magic link opzionale come bonus).

---

## 3. Schema del Database (Supabase / Postgres)

Crea la tabella `misurazioni`, collegata a `auth.users`, con RLS abilitata così ogni utente vede solo i propri dati.

```sql
create table public.misurazioni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_misurazione date not null default current_date,

  -- Statistiche chiave
  peso_kg numeric(5,2),
  massa_grassa_kg numeric(5,2),
  massa_magra_kg numeric(5,2),
  grasso_corporeo_percentuale numeric(5,2),
  collo_cm numeric(5,2),
  torace_superiore_cm numeric(5,2),
  petto_cm numeric(5,2),
  vita_cm numeric(5,2),

  -- Braccia
  braccio_sinistro_cm numeric(5,2),
  braccio_destro_cm numeric(5,2),

  -- Gambe
  fianchi_cm numeric(5,2),
  vita_fianchi_cm numeric(5,2),
  coscia_superiore_sinistra_cm numeric(5,2),
  coscia_superiore_destra_cm numeric(5,2),
  coscia_inferiore_sinistra_cm numeric(5,2),
  coscia_inferiore_destra_cm numeric(5,2),
  polpaccio_sinistro_cm numeric(5,2),
  polpaccio_destro_cm numeric(5,2),

  note text,
  created_at timestamptz not null default now()
);

alter table public.misurazioni enable row level security;

create policy "Utenti vedono solo le proprie misurazioni"
  on public.misurazioni for select
  using (auth.uid() = user_id);

create policy "Utenti inseriscono solo le proprie misurazioni"
  on public.misurazioni for insert
  with check (auth.uid() = user_id);

create policy "Utenti aggiornano solo le proprie misurazioni"
  on public.misurazioni for update
  using (auth.uid() = user_id);

create policy "Utenti eliminano solo le proprie misurazioni"
  on public.misurazioni for delete
  using (auth.uid() = user_id);

create index misurazioni_user_data_idx on public.misurazioni (user_id, data_misurazione desc);
```

> Nota: ho interpretato "vita-fianchi" come un campo di circonferenza a sé stante, così come elencato. Se invece deve essere un rapporto calcolato (vita/fianchi), chiedi a Claude di calcolarlo come campo derivato in fase di visualizzazione invece che salvarlo nel DB.

---

## 4. Struttura delle pagine/route

```
/login                      → form di accesso/registrazione
/dashboard                  → layout con sidebar di navigazione
  /dashboard                → home: riepilogo dati utente
  /dashboard/storico         → tabella con tutte le misurazioni
  /dashboard/progressi       → grafici andamento filtrabili
```

In ogni pagina dell'area `/dashboard` deve essere presente un bottone **"+ Nuova misurazione"** che apre un **pannello laterale (componente `Sheet` di shadcn/ui)** contenente il form di inserimento dati.

---

## 5. Form di inserimento dati biometrici (pannello laterale)

Il form deve essere diviso in **3 sezioni** (usa `Tabs` oppure un accordion, con indicatore di avanzamento tra le sezioni):

**Sezione 1 — Statistiche chiave**
| Campo | Unità |
|---|---|
| Peso | kg |
| Massa grassa | kg |
| Massa magra | kg |
| Grasso corporeo | % |
| Collo | cm |
| Parte superiore torace | cm |
| Petto | cm |
| Vita | cm |

**Sezione 2 — Braccia**
| Campo | Unità |
|---|---|
| Braccio sinistro | cm |
| Braccio destro | cm |

**Sezione 3 — Gambe**
| Campo | Unità |
|---|---|
| Fianchi | cm |
| Vita-fianchi | cm |
| Coscia superiore sinistra | cm |
| Coscia superiore destra | cm |
| Coscia inferiore sinistra | cm |
| Coscia inferiore destra | cm |
| Polpaccio sinistro | cm |
| Polpaccio destro | cm |

Requisiti del form:

- Tutti i campi numerici, opzionali tranne **peso** e **data misurazione** (obbligatori).
- Validazione con `zod` (valori positivi, range plausibili, es. peso 20–300 kg, percentuali 0–100).
- Data della misurazione selezionabile (default: oggi).
- Campo note testuale libero, opzionale.
- Salvataggio tramite **Server Action**, con toast di conferma e chiusura automatica del pannello al salvataggio riuscito.
- Etichette, placeholder e messaggi di errore tutti in italiano.

---

## 6. Dashboard principale (`/dashboard`)

- Card con **ultimo peso registrato** e variazione rispetto alla misurazione precedente (▲/▼ con colore).
- Card per **massa magra**, **massa grassa**, **grasso corporeo** con relative variazioni.
- Mini grafico sparkline dell'andamento del peso (ultimi 30/90 giorni).
- Data dell'ultima misurazione registrata.
- Empty state chiaro e invitante se l'utente non ha ancora inserito dati ("Inserisci la tua prima misurazione").

---

## 7. Pagina Storico (`/dashboard/storico`)

- Tabella (`Table` di shadcn/ui) con tutte le misurazioni ordinate per data decrescente.
- Colonne principali visibili: data, peso, massa magra, massa grassa, grasso corporeo.
- Riga espandibile o dialog di dettaglio per vedere **tutte** le circonferenze inserite in quella misurazione.
- Azioni per riga: **modifica** (riapre il form precompilato nel pannello laterale) ed **elimina** (con conferma).
- Paginazione (o infinite scroll) per gestire storici lunghi.

---

## 8. Pagina Progressi (`/dashboard/progressi`)

- Selettore metrica: peso, massa magra, massa grassa, grasso corporeo, e possibilità di scegliere anche le altre circonferenze (vita, fianchi, braccia, gambe, ecc.).
- Selettore intervallo temporale: 7 / 30 / 90 / 365 giorni / tutto lo storico.
- Grafico a linee (`recharts`) con tooltip che mostra valore e data.
- Riepilogo statistico sopra il grafico: variazione totale nel periodo, valore medio, minimo, massimo.
- Possibilità di sovrapporre più metriche sullo stesso grafico (facoltativo, bonus).

---

## 9. Requisiti UI/UX

- Design **mobile-first**, completamente responsive (l'app deve essere usabile comodamente da smartphone).
- Palette pulita, tema "salute/fitness" (es. neutri + un colore accento, tipo verde o blu).
- Stati di **loading** con skeleton, non spinner generici dove possibile.
- Tutte le etichette, unità di misura e messaggi in **italiano**.
- Feedback visivo immediato su ogni azione (salvataggio, errore, eliminazione).

---

## 10. Gestione errori

- `try/catch` su tutte le chiamate a Supabase, sia lato client che nelle Server Actions.
- Messaggi di errore comprensibili all'utente (mai mostrare errori tecnici grezzi).
- Gestione della sessione scaduta con redirect automatico al login.

---

## 11. Variabili d'ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 12. Output atteso da Claude

1. Struttura completa delle cartelle del progetto.
2. Script SQL completo da eseguire su Supabase (tabella + RLS + indici).
3. Codice completo, file per file, di tutte le pagine, componenti, Server Actions e utility.
4. Istruzioni di setup: creazione progetto Supabase, configurazione `.env.local`, comandi per installare le dipendenze e avviare il progetto in locale.

---

## Extra facoltativi (solo se avanza tempo/spazio)

- Dark mode.
- Esportazione dello storico in CSV.
- Calcolo automatico del rapporto vita-fianchi.
- Obiettivo peso impostabile dall'utente, con indicatore di progresso verso il target.
