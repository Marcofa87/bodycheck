import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Destinazione dei link inviati via email da Supabase (conferma registrazione,
 * recupero password, magic link). Scambia il `code` con una sessione e reindirizza
 * a `next` (solo percorsi interni), altrimenti alla dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const destinazione = percorsoInterno(searchParams.get("next")) ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${destinazione}`);
      }
      console.error("[auth/callback]", error.message);
    } catch (err) {
      console.error("[auth/callback]", err);
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("errore", "link-non-valido");
  return NextResponse.redirect(loginUrl);
}

/** Accetta solo percorsi relativi alla stessa origine (es. `/reimposta-password`), mai URL esterni. */
function percorsoInterno(valore: string | null): string | null {
  if (!valore || !valore.startsWith("/") || valore.startsWith("//")) return null;
  return valore;
}
