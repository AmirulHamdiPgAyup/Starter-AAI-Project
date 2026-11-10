"use client";

import { useActionState, useState, useTransition } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ErrorMessage, Label, fieldClass } from "../ui/Field";
import type { ActionResult } from "@/app/actions";

// A server action from leave-actions.ts, used with useActionState.
export type ServerAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

// Confirm box for a decision (design §11). Rejections also carry the
// mandatory remark here (design §10.5); the server re-checks it. A server
// error (like a missing remark) stays visible inside the dialog; on success
// the action redirects back to the queue and the page shows the success
// pop-up.
export function DecisionDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  remark = false,
  action,
  requestId,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  remark?: boolean;
  action: ServerAction;
  requestId: number;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [remarkText, setRemarkText] = useState("");
  const [, startTransition] = useTransition();

  return (
    <Modal open={open} onClose={() => !pending && onCancel()}>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{message}</p>

      {remark ? (
        <div className="mt-4">
          <Label htmlFor={`remark-${requestId}`}>Remark (required)</Label>
          <textarea
            id={`remark-${requestId}`}
            rows={3}
            className={fieldClass(Boolean(state.error))}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Tell the employee why…"
          />
        </div>
      ) : null}

      <div className="mt-4">
        <ErrorMessage message={state.error} />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant={danger ? "danger" : "success"}
          disabled={pending}
          onClick={() => {
            if (pending) return;
            const data = new FormData();
            data.set("id", String(requestId));
            if (remark) data.set("remark", remarkText);
            startTransition(() => formAction(data));
          }}
        >
          {pending ? "Saving…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
