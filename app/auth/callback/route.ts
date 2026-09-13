import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Destinazione del link di conferma email (e di eventuali magic link).
 * Scambia il `code` ricevuto da Supabase con una sessione e reindirizza alla dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/dashboard`);
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
