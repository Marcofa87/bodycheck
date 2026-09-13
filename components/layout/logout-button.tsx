"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { esci } from "@/lib/actions/auth";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon" | "icon-sm";
  className?: string;
  soloIcona?: boolean;
}

export function LogoutButton({ variant = "ghost", size = "default", className, soloIcona }: LogoutButtonProps) {
  return (
    <form action={esci}>
      <Submit variant={variant} size={size} className={className} soloIcona={soloIcona} />
    </form>
  );
}

function Submit({ variant, size, className, soloIcona }: LogoutButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      aria-label={soloIcona ? "Esci" : undefined}
    >
      {pending ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
      {!soloIcona && (pending ? "Uscita…" : "Esci")}
    </Button>
  );
}
