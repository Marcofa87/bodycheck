"use client";

import { CircleAlertIcon, CircleCheckIcon, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
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

type Modalita = "accedi" | "registrati";

const TESTI: Record<
  Modalita,
  { titolo: string; descrizione: string; bottone: string; bottoneAttesa: string; switchTesto: string; switchAzione: string }
> = {
  accedi: {
    titolo: "Bentornato",
    descrizione: "Accedi con email e password per vedere i tuoi progressi.",
    bottone: "Accedi",
    bottoneAttesa: "Accesso in corso…",
    switchTesto: "Non hai un account?",
    switchAzione: "Registrati",
  },
  registrati: {
    titolo: "Crea il tuo account",
    descrizione: "Bastano email e password. Riceverai un'email di conferma.",
    bottone: "Registrati",
    bottoneAttesa: "Registrazione in corso…",
    switchTesto: "Hai già un account?",
    switchAzione: "Accedi",
  },
};

interface LoginFormProps {
  messaggioIniziale?: string;
}

export function LoginForm({ messaggioIniziale }: LoginFormProps) {
  const [modalita, setModalita] = useState<Modalita>("accedi");

  return (
    <Card className="w-full max-w-sm">
      {/* La key forza il reset dello stato dell'action quando si cambia modalità */}
      <FormInterno
        key={modalita}
        modalita={modalita}
        messaggioIniziale={messaggioIniziale}
        onCambiaModalita={() => setModalita((m) => (m === "accedi" ? "registrati" : "accedi"))}
      />
    </Card>
  );
}

interface FormInternoProps {
  modalita: Modalita;
  messaggioIniziale?: string;
  onCambiaModalita: () => void;
}

function FormInterno({ modalita, messaggioIniziale, onCambiaModalita }: FormInternoProps) {
  const statoIniziale: AuthState = messaggioIniziale
    ? { status: "error", message: messaggioIniziale }
    : { status: "idle" };

  const [state, formAction, pending] = useActionState(autentica, statoIniziale);
  const [mostraPassword, setMostraPassword] = useState(false);
  const testi = TESTI[modalita];

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="modalita" value={modalita} />

      <CardHeader>
        <CardTitle className="text-lg">{testi.titolo}</CardTitle>
        <CardDescription>{testi.descrizione}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nome@esempio.it"
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={mostraPassword ? "text" : "password"}
              autoComplete={modalita === "accedi" ? "current-password" : "new-password"}
              placeholder="Almeno 6 caratteri"
              minLength={6}
              required
              disabled={pending}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setMostraPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={mostraPassword ? "Nascondi password" : "Mostra password"}
              tabIndex={-1}
            >
              {mostraPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </div>

        {state.status !== "idle" && (
          <div
            role={state.status === "error" ? "alert" : "status"}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              state.status === "error"
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : "border-primary/30 bg-primary/5 text-primary",
            )}
          >
            {state.status === "error" ? (
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{state.message}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? testi.bottoneAttesa : testi.bottone}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {testi.switchTesto}{" "}
          <button
            type="button"
            onClick={onCambiaModalita}
            className="font-medium text-primary underline-offset-4 hover:underline"
            disabled={pending}
          >
            {testi.switchAzione}
          </button>
        </p>
      </CardFooter>
    </form>
  );
}
