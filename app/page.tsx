import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getOptionalUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  // Rendering sempre a runtime: le variabili d'ambiente non devono essere "congelate" in build.
  await connection();

  if (!isSupabaseConfigured()) redirect("/login");

  const user = await getOptionalUser();
  redirect(user ? "/dashboard" : "/login");
}
