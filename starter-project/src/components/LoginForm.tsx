"use client";

import { useState } from "react";
import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Button } from "./ui/Button";
import { ErrorMessage, Label, inputClass } from "./ui/Field";
import { HCaptcha } from "./HCaptcha";

export function LoginForm({ sitekey }: { sitekey: string }) {
  const [state, formAction, pending] = useActionState(loginAction, {});

  // CAPTCHA tokens are single-use. The counter feeds HCaptcha's key so
  // every submission replaces the widget with a fresh one; because React
  // snapshots the form data during the submit dispatch (before this state
  // update renders), the attempt that is being verified keeps its token
  // and the next attempt always starts with a new one (§12c).
  const [attempt, setAttempt] = useState(0);

  return (
    <form action={formAction} className="space-y-5" onSubmit={() => setAttempt((n) => n + 1)}>
      <ErrorMessage message={state.error} />

      <div>
        <Label htmlFor="email">Email</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <HCaptcha sitekey={sitekey} resetKey={attempt} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
