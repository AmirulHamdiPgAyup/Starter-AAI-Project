"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { sendToHr } from "@/app/leave-actions";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorMessage } from "../ui/Field";

// Row buttons for the employee's own requests (design §11). The actions
// shown here are computed on the server with allowedActions(); the server
// action checks the same rules again before saving.
export function RequestActions({
  requestId,
  canSendToHr = false,
  canResubmit = false,
}: {
  requestId: number;
  canSendToHr?: boolean;
  canResubmit?: boolean;
}) {
  const [state, action, pending] = useActionState(sendToHr, {});
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();

  if (!canSendToHr && !canResubmit) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canSendToHr ? (
          <Button variant="secondary" disabled={pending} onClick={() => setConfirming(true)}>
            Send to HR
          </Button>
        ) : null}
        {canResubmit ? (
          // Placeholder until Task 13 builds the edit & resubmit screen.
          <Button variant="secondary" disabled title="Coming in the next task">
            Edit &amp; resubmit
          </Button>
        ) : null}
      </div>
      <ErrorMessage message={state.error} />

      <ConfirmDialog
        open={confirming}
        title="Send this request to HR?"
        message="It will join the shared HR queue for a decision."
        confirmLabel="Send to HR"
        onConfirm={() => {
          setConfirming(false);
          if (pending) return;
          const data = new FormData();
          data.set("id", String(requestId));
          startTransition(() => action(data));
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
