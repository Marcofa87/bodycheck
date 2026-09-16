"use client";

import { useActionState, useState, type ReactNode } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { autentica, type AuthState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type Modalita = "accedi" | "registrati" | "recupera";

interface Testi {
  titolo: string;
  descrizione: string;
  bottone: string;
  bottoneAttesa: string;
  switchTesto: string;
  switchAzione: string;
  switchDestinazione: Modalita;
}

const TESTI: Record<Modalita, Testi> = {
  accedi: {
    titolo: "Bentornato",
    descrizione: "Accedi con email e password per vedere i tuoi progressi.",
    bottone: "Accedi",
    bottoneAttesa: "Accesso in corso…",
    switchTesto: "Non hai un account?",
    switchAzione: "Registrati",
    switchDestinazione: "registrati",
  },
  registrati: {
    titolo: "Crea il tuo account",
    descrizione: "Bastano email e password. Riceverai un'email di conferma.",
    bottone: "Registrati",
    bottoneAttesa: "Registrazione in corso…",
    switchTesto: "Hai già un account?",
    switchAzione: "Accedi",
    switchDestinazione: "accedi",
  },
  recupera: {
    titolo: "Password dimenticata?",
    descrizione: "Inserisci la tua email: ti invieremo un link per impostarne una nuova.",
    bottone: "Invia link di reimpostazione",
    bottoneAttesa: "Invio in corso…",
    switchTesto: "Ricordi la password?",
    switchAzione: "Torna al login",
    switchDestinazione: "accedi",
  },
};

interface LoginFormProps {
  messaggioIniziale?: string;
}

export function LoginForm({ messaggioIniziale }: LoginFormProps) {
  const [modalita, setModalita] = useState<Modalita>("accedi");
  // Controllata qui perché il cambio di `key` rimonta il form: l'email digitata non va persa.
  const [email, setEmail] = useState("");

  return (
    <Card className="w-full max-w-sm">
      {/* La key forza il reset dello stato dell'action quando si cambia modalità */}
      <FormInterno
        key={modalita}
        modalita={modalita}
        email={email}
        onEmailChange={setEmail}
        messaggioIniziale={modalita === "accedi" ? messaggioIniziale : undefined}
        onCambiaModalita={setModalita}
      />
    </Card>
  );
}

interface FormInternoProps {
  modalita: Modalita;
  email: string;
  onEmailChange: (email: string) => void;
  messaggioIniziale?: string;
  onCambiaModalita: (modalita: Modalita) => void;
}

function FormInterno({
  modalita,
  email,
  onEmailChange,
  messaggioIniziale,
  onCambiaModalita,
}: FormInternoProps) {
  const statoIniziale: AuthState = messaggioIniziale
    ? { status: "error", message: messaggioIniziale }
    : { status: "idle" };

  const [state, formAction, pending] = useActionState(autentica, statoIniziale);
  const testi = TESTI[modalita];
  // Dopo l'invio del link il form non serve più: si mostra solo la conferma.
  const linkInviato = modalita === "recupera" && state.status === "success";

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="modalita" value={modalita} />

      <CardHeader>
        <CardTitle className="text-lg">{testi.titolo}</CardTitle>
        <CardDescription>{testi.descrizione}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {!linkInviato && (
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nome@esempio.it"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              disabled={pending}
            />
          </div>
        )}

        {modalita !== "recupera" && (
          <CampoPassword
            id="password"
            name="password"
            label="Password"
            autoComplete={modalita === "accedi" ? "current-password" : "new-password"}
            disabled={pending}
            azione={
              modalita === "accedi" && (
                <LinkModalita onClick={() => onCambiaModalita("recupera")} disabled={pending} className="text-xs">
                  Password dimenticata?
                </LinkModalita>
              )
            }
          />
        )}

        <MessaggioStato state={state} />
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        {!linkInviato && (
          <BottoneInvio pending={pending} testo={testi.bottone} testoAttesa={testi.bottoneAttesa} />
        )}

        <p className="text-center text-sm text-muted-foreground">
          {testi.switchTesto}{" "}
          <LinkModalita onClick={() => onCambiaModalita(testi.switchDestinazione)} disabled={pending}>
            {testi.switchAzione}
          </LinkModalita>
        </p>
      </CardFooter>
    </form>
  );
}

interface LinkModalitaProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** Link testuale (button) per passare da una modalità all'altra del form. */
function LinkModalita({ onClick, disabled, className, children }: LinkModalitaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("font-medium text-primary underline-offset-4 hover:underline", className)}
    >
      {children}
    </button>
  );
}
