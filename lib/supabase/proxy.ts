import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv, isSupabaseConfigured } from "./env";
import type { Database } from "./types";

const PROTECTED_PREFIXES = ["/dashboard", "/api"];
const AUTH_PAGES = ["/login"];

/**
 * Aggiorna la sessione Supabase (refresh del token se scaduto) e applica
 * i redirect di autenticazione. Chiamata da `proxy.ts` su ogni richiesta.
 */
export async function updateSession(request: NextRequest) {
  // Senza credenziali lasciamo passare: le pagine mostreranno le istruzioni di setup.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims verifica il JWT (localmente se il progetto usa chiavi asimmetriche,
  // altrimenti tramite il server Auth) e rinfresca la sessione se necessario.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!isAuthenticated && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return withCookies(NextResponse.redirect(redirectUrl), supabaseResponse);
  }

  if (isAuthenticated && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return withCookies(NextResponse.redirect(redirectUrl), supabaseResponse);
  }

  return supabaseResponse;
}

/** Propaga gli eventuali cookie di sessione rinfrescati anche sulle risposte di redirect. */
function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}
