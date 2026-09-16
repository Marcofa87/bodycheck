"use server";

import type { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

type TraduttoreAuth = Awaited<ReturnType<typeof getTranslations<"auth">>>;

function creaSchemi(t: TraduttoreAuth) {
  const emailSchema = z.email(t("errori.emailNonValida")).trim().toLowerCase();
  const passwordSchema = z.string().min(6, t("errori.passwordCorta"));

  return {
    email: z.object({ email: emailSchema }),
    credenziali: z.object({ email: emailSchema, password: passwordSchema }),
    nuovaPassword: z
      .object({ password: passwordSchema, conferma: z.string() })
      .refine((d) => d.password === d.conferma, {
        message: t("errori.passwordDiverse"),
        path: ["conferma"],
      }),
  };
}

/** Valida i campi del form con lo schema indicato, restituendo il primo errore leggibile. */
function leggiCampi<T extends z.ZodType>(
  t: TraduttoreAuth,
  schema: T,
  valori: Record<string, FormDataEntryValue | null>,
) {
  const result = schema.safeParse(valori);
  if (!result.success) {
    return {
      ok: false as const,
      message: result.error.issues[0]?.message ?? t("errori.datiNonValidi"),
    };
  }
  return { ok: true as const, data: result.data as z.infer<T> };
}

function leggiCredenziali(t: TraduttoreAuth, formData: FormData) {
  return leggiCampi(t, creaSchemi(t).credenziali, {
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

/** Origine (protocollo + host) da cui è partita la richiesta: serve per i link nelle email. */
async function originRichiesta() {
  return (await headers()).get("origin") ?? "";
}

/** Traduce gli errori di Supabase Auth in messaggi comprensibili. */
function messaggioErroreAuth(t: TraduttoreAuth, error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return t("errori.invalid_credentials");
    case "email_not_confirmed":
      return t("errori.email_not_confirmed");
    case "user_already_exists":
    case "email_exists":
      return t("errori.user_already_exists");
    case "weak_password":
      return t("errori.weak_password");
    case "same_password":
      return t("errori.same_password");
    case "session_not_found":
    case "session_expired":
    case "otp_expired":
      return t("errori.session_expired");
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return t("errori.rate_limit");
    case "signup_disabled":
      return t("errori.signup_disabled");
    case "validation_failed":
      return t("errori.validation_failed");
    default:
      console.error("[auth]", error.code, error.message);
      return t("errori.generico");
  }
}

export async function accedi(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth");
  const credenziali = leggiCredenziali(t, formData);
  if (!credenziali.ok) return { status: "error", message: credenziali.message };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(credenziali.data);
    if (error) return { status: "error", message: messaggioErroreAuth(t, error) };
  } catch (err) {
    console.error("[accedi]", err);
    return { status: "error", message: t("errori.server") };
  }

  redirect("/dashboard");
}

export async function registrati(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth");
  const credenziali = leggiCredenziali(t, formData);
  if (!credenziali.ok) return { status: "error", message: credenziali.message };

  let sessioneCreata = false;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      ...credenziali.data,
      options: { emailRedirectTo: `${await originRichiesta()}/auth/callback` },
    });
    if (error) return { status: "error", message: messaggioErroreAuth(t, error) };

    // Con la conferma email attiva (default) Supabase non crea subito la sessione.
    // Se l'email risulta già registrata, `identities` è vuoto.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { status: "error", message: t("errori.user_already_exists") };
    }
    sessioneCreata = Boolean(data.session);
  } catch (err) {
    console.error("[registrati]", err);
    return { status: "error", message: t("errori.server") };
  }

  if (sessioneCreata) redirect("/dashboard");

  return { status: "success", message: t("successo.registrazione") };
}

/**
 * Invia l'email con il link per reimpostare la password.
 * Il link passa da `/auth/callback`, che crea la sessione di recupero e porta a `/reimposta-password`.
 */
export async function richiediRecuperoPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = await getTranslations("auth");
  const campi = leggiCampi(t, creaSchemi(t).email, { email: formData.get("email") });
  if (!campi.ok) return { status: "error", message: campi.message };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(campi.data.email, {
      redirectTo: `${await originRichiesta()}/auth/callback?next=/reimposta-password`,
    });
    if (error) return { status: "error", message: messaggioErroreAuth(t, error) };
  } catch (err) {
    console.error("[richiediRecuperoPassword]", err);
    return { status: "error", message: t("errori.server") };
  }

  // Messaggio identico sia che l'email esista o no: evita di rivelare quali account sono registrati.
  return { status: "success", message: t("successo.recupero") };
}

/** Imposta la nuova password dell'utente autenticato tramite il link di recupero. */
export async function aggiornaPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth");
  const campi = leggiCampi(t, creaSchemi(t).nuovaPassword, {
    password: formData.get("password"),
    conferma: formData.get("conferma"),
  });
  if (!campi.ok) return { status: "error", message: campi.message };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: campi.data.password });
    if (error) return { status: "error", message: messaggioErroreAuth(t, error) };
  } catch (err) {
    console.error("[aggiornaPassword]", err);
    return { status: "error", message: t("errori.server") };
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
