"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth.reimposta");
  const [state, formAction, pending] = useActionState(aggiornaPassword, STATO_INIZIALE);

  return (
    <Card className="w-full max-w-sm">
      <form action={formAction} noValidate>
        <CardHeader>
          <CardTitle className="text-lg">{t("titolo")}</CardTitle>
          <CardDescription>
            {email
              ? t.rich("descrizioneConEmail", {
                  email,
                  b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
                })
              : t("descrizione")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <CampoPassword
            id="password"
            name="password"
            label={t("nuovaPassword")}
            autoComplete="new-password"
            autoFocus
            disabled={pending}
          />
          <CampoPassword
            id="conferma"
            name="conferma"
            label={t("confermaPassword")}
            placeholder={t("ripetiPassword")}
            autoComplete="new-password"
            disabled={pending}
          />

          <MessaggioStato state={state} />
        </CardContent>

        <CardFooter className="pt-2">
          <BottoneInvio pending={pending} testo={t("bottone")} testoAttesa={t("bottoneAttesa")} />
        </CardFooter>
      </form>
    </Card>
  );
}
