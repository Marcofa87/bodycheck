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

const credenzialiSchema = z.object({
  email: z.email("Inserisci un indirizzo email valido").trim().toLowerCase(),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

function leggiCredenziali(formData: FormData) {
  const result = credenzialiSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) {
    return { ok: false as const, message: result.error.issues[0]?.message ?? "Dati non validi" };
  }
  return { ok: true as const, data: result.data };
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
    const origin = (await headers()).get("origin") ?? "";

    const { data, error } = await supabase.auth.signUp({
      ...credenziali.data,
      options: { emailRedirectTo: `${origin}/auth/callback` },
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

/** Unica action usata dal form di login: smista in base al campo nascosto `modalita`. */
export async function autentica(prev: AuthState, formData: FormData): Promise<AuthState> {
  const modalita = formData.get("modalita");
  return modalita === "registrati" ? registrati(prev, formData) : accedi(prev, formData);
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
