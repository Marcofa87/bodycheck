"use client";

import { useActionState } from "react";

import { BottoneInvio } from "@/components/auth/bottone-invio";
import { CampoPassword } from "@/components/auth/campo-password";
import { MessaggioStato } from "@/components/auth/messaggio-stato";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { aggiornaPassword, type AuthState } from "@/lib/actions/auth";

const STATO_INIZIALE: AuthState = { status: "idle" };

interface ReimpostaPasswordFormProps {
  email?: string;
}

/** Form mostrato dopo aver aperto il link di recupero: chiede e conferma la nuova password. */
export function ReimpostaPasswordForm({ email }: ReimpostaPasswordFormProps) {
  const [state, formAction, pending] = useActionState(aggiornaPassword, STATO_INIZIALE);

  return (
    <Card className="w-full max-w-sm">
      <form action={formAction} noValidate>
        <CardHeader>
          <CardTitle className="text-lg">Scegli una nuova password</CardTitle>
          <CardDescription>
            {email ? (
              <>
                Stai reimpostando la password di <span className="font-medium text-foreground">{email}</span>.
              </>
            ) : (
              "Inserisci la nuova password per il tuo account."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <CampoPassword
            id="password"
            name="password"
            label="Nuova password"
            autoComplete="new-password"
            autoFocus
            disabled={pending}
          />
          <CampoPassword
            id="conferma"
            name="conferma"
            label="Conferma password"
            placeholder="Ripeti la password"
            autoComplete="new-password"
            disabled={pending}
          />

          <MessaggioStato state={state} />
        </CardContent>

        <CardFooter className="pt-2">
          <BottoneInvio pending={pending} testo="Salva nuova password" testoAttesa="Salvataggio in corso…" />
        </CardFooter>
      </form>
    </Card>
  );
}
