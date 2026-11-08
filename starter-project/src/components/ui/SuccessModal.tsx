"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { CheckIcon } from "./Icons";

// Pop-up shown after an action succeeds.
export function SuccessModal({
  open,
  title,
  message,
  actionLabel = "Done",
  onAction,
}: {
  open: boolean;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <Modal open={open} onClose={onAction}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
        {message ? <p className="mt-1 text-sm text-slate-600">{message}</p> : null}
        <Button className="mt-6 w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}
