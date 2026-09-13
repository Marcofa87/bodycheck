import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// In Next.js 16 il file `middleware.ts` è deprecato: la convenzione è `proxy.ts`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Tutte le richieste tranne:
     * - _next/static, _next/image (asset di Next)
     * - favicon e file immagine statici
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
