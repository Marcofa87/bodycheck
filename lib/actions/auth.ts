"use server";

import type { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const emailSchema = z.email("Inserisci un indirizzo email valido").trim().toLowerCase();
const passwordSchema = z.string().min(6, "La password deve avere almeno 6 caratteri");

const credenzialiSchema = z.object({ email: emailSchema, password: passwordSchema });

const nuovaPasswordSchema = z
  .object({ password: passwordSchema, conferma: z.string() })
  .refine((d) => d.password === d.conferma, {
    message: "Le due password non coincidono.",
    path: ["conferma"],
  });

/** Valida i campi del form con lo schema indicato, restituendo il primo errore leggibile. */
function leggiCampi<T extends z.ZodType>(schema: T, valori: Record<string, FormDataEntryValue | null>) {
  const result = schema.safeParse(valori);
  if (!result.success) {
    return { ok: false as const, message: result.error.issues[0]?.message ?? "Dati non validi" };
  }
  return { ok: true as const, data: result.data as z.infer<T> };
}

function leggiCredenziali(formData: FormData) {
  return leggiCampi(credenzialiSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

/** Origine (protocollo + host) da cui è partita la richiesta: serve per i link nelle email. */
async function originRichiesta() {
  return (await headers()).get("origin") ?? "";
}

/** Traduce gli errori di Supabase Auth in messaggi comprensibili. */
function messaggioErroreAuth(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Email o password non corretti.";
    case "email_not_confirmed":
      return "Devi confermare l'email prima di accedere: controlla la tua casella di posta.";
    case "user_already_exists":
    case "email_exists":
      return "Esiste già un account con questa email. Prova ad accedere.";
    case "weak_password":
      return "La password è troppo debole: usa almeno 6 caratteri.";
    case "same_password":
      return "La nuova password deve essere diversa da quella attuale.";
    case "session_not_found":
    case "session_expired":
    case "otp_expired":
      return "Il link non è più valido o la sessione è scaduta. Richiedi un nuovo link di reimpostazione.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Troppi tentativi: attendi qualche minuto e riprova.";
    case "signup_disabled":
      return "La registrazione non è al momento disponibile.";
    case "validation_failed":
      return "I dati inseriti non sono validi.";
    default:
      console.error("[auth]", error.code, error.message);
      return "Si è verificato un errore durante l'autenticazione. Riprova.";
  }
}

export async function accedi(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credenziali = leggiCredenziali(formData);
  if (!credenziali.ok) return { status: "error", message: credenziali.message };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(credenziali.data);
    if (error) return { status: "error", message: messaggioErroreAuth(error) };
  } catch (err) {
    console.error("[accedi]", err);
    return { status: "error", message: "Impossibile contattare il server. Riprova più tardi." };
  }

  redirect("/dashboard");
}

export async function registrati(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credenziali = leggiCredenziali(formData);
  if (!credenziali.ok) return { status: "error", message: credenziali.message };

  let sessioneCreata = false;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      ...credenziali.data,
      options: { emailRedirectTo: `${await originRichiesta()}/auth/callback` },
    });
    if (error) return { status: "error", message: messaggioErroreAuth(error) };

    // Con la conferma email attiva (default) Supabase non crea subito la sessione.
    // Se l'email risulta già registrata, `identities` è vuoto.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return {
        status: "error",
        message: "Esiste già un account con questa email. Prova ad accedere.",
      };
    }
    sessioneCreata = Boolean(data.session);
  } catch (err) {
    console.error("[registrati]", err);
    return { status: "error", message: "Impossibile contattare il server. Riprova più tardi." };
  }

  if (sessioneCreata) redirect("/dashboard");

  return {
    status: "success",
    message: "Registrazione completata! Controlla la tua email e clicca sul link di conferma.",
  };
}

/**
 * Invia l'email con il link per reimpostare la password.
 * Il link passa da `/auth/callback`, che crea la sessione di recupero e porta a `/reimposta-password`.
 */
export async function richiediRecuperoPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const campi = leggiCampi(z.object({ email: emailSchema }), { email: formData.get("email") });
  if (!campi.ok) return { status: "error", message: campi.message };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(campi.data.email, {
      redirectTo: `${await originRichiesta()}/auth/callback?next=/reimposta-password`,
    });
    if (error) return { status: "error", message: messaggioErroreAuth(error) };
  } catch (err) {
    console.error("[richiediRecuperoPassword]", err);
    return { status: "error", message: "Impossibile contattare il server. Riprova più tardi." };
  }

  // Messaggio identico sia che l'email esista o no: evita di rivelare quali account sono registrati.
  return {
    status: "success",
    message:
      "Se esiste un account con questa email riceverai a breve un link per reimpostare la password. Controlla anche la cartella spam.",
  };
}

/** Imposta la nuova password dell'utente autenticato tramite il link di recupero. */
export async function aggiornaPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const campi = leggiCampi(nuovaPasswordSchema, {
    password: formData.get("password"),
    conferma: formData.get("conferma"),
  });
  if (!campi.ok) return { status: "error", message: campi.message };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: campi.data.password });
    if (error) return { status: "error", message: messaggioErroreAuth(error) };
  } catch (err) {
    console.error("[aggiornaPassword]", err);
    return { status: "error", message: "Impossibile contattare il server. Riprova più tardi." };
  }

  redirect("/dashboard");
}

/** Unica action usata dal form di login: smista in base al campo nascosto `modalita`. */
export async function autentica(prev: AuthState, formData: FormData): Promise<AuthState> {
  switch (formData.get("modalita")) {
    case "registrati":
      return registrati(prev, formData);
    case "recupera":
      return richiediRecuperoPassword(prev, formData);
    default:
      return accedi(prev, formData);
  }
}

export async function esci(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[esci]", err);
  }
  redirect("/login");
}
