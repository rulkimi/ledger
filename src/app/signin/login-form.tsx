"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, LockKeyhole } from "lucide-react";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(authenticate, { error: undefined });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="pl-9 h-10 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="pl-9 h-10 bg-muted/40 border-border/60 focus-visible:bg-background transition-colors"
          />
        </div>
      </div>

      {state?.error && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
