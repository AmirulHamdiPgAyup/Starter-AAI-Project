"use client";

import { useState, useTransition, useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/actions";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { ErrorMessage, HelpText, Label, fieldClass } from "./ui/Field";

// Sign-up (design §12b). Creating an account asks for confirmation first.
// On success the action signs the new person in and redirects to
// /employee?joined=1, where the page itself shows the success pop-up
// (design §11) — the screen changes, so it uses the page-level modal.
export function SignupForm({ divisions }: { divisions: string[] }) {
  const [state, formAction, pending] = useActionState(signupAction, {});
  const [confirming, setConfirming] = useState(false);
  const [toSend, setToSend] = useState<FormData | null>(null);
  const [, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        // Empty/short fields are stopped by the browser (required/minLength);
        // the server checks everything again.
        if (pending || confirming) return;
        setToSend(new FormData(e.currentTarget));
        setConfirming(true);
      }}
    >
      <ErrorMessage message={state.error} />

      <div>
        <Label htmlFor="name">Full name</Label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={fieldClass()}
        />
      </div>

      <div>
        <Label htmlFor="email">Work email</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass()}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClass()}
        />
        <HelpText>At least 8 characters.</HelpText>
      </div>

      <div>
        <Label htmlFor="division">Division</Label>
        <select id="division" name="division" required defaultValue="" className={fieldClass()}>
          <option value="" disabled>
            Choose a division
          </option>
          {divisions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="submit" disabled={pending || confirming}>
          {pending ? "Creating…" : "Create account"}
        </Button>
        <Link href="/login" className="text-sm font-medium text-brand-600 hover:underline">
          Back to log in
        </Link>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Create your account?"
        message="You will be signed in straight away as an Employee."
        confirmLabel="Create account"
        onConfirm={() => {
          setConfirming(false);
          if (toSend && !pending) startTransition(() => formAction(toSend));
        }}
        onCancel={() => setConfirming(false)}
      />
    </form>
  );
}
