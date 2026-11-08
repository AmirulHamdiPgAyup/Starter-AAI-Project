"use client";

import { useState, useTransition } from "react";
import { logoutAction } from "@/app/actions";
import { LogoutIcon } from "./ui/Icons";
import { ConfirmDialog } from "./ui/ConfirmDialog";

export function LogoutButton() {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
      >
        <LogoutIcon className="h-4 w-4" />
        {pending ? "Logging out…" : "Log out"}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Log out?"
        message="You will need your email and password to sign in again."
        confirmLabel="Log out"
        onConfirm={() => {
          setConfirming(false);
          start(() => logoutAction());
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
