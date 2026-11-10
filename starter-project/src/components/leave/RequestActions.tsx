"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import {
  rejectBySupervisor,
  sendToHr,
  signLeave,
} from "@/app/leave-actions";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorMessage } from "../ui/Field";
import { DecisionDialog } from "./DecisionDialog";

// Row buttons for every queue (design §11). The actions shown here are
// computed on the server with allowedActions(); the server action checks the
// same rules again before saving.
export function RequestActions({
  requestId,
  canSendToHr = false,
  canResubmit = false,
  canSign = false,
  canRejectAsSupervisor = false,
}: {
  requestId: number;
  canSendToHr?: boolean;
  canResubmit?: boolean;
  canSign?: boolean;
  canRejectAsSupervisor?: boolean;
}) {
  const [state, action, pending] = useActionState(sendToHr, {});
  const [confirming, setConfirming] = useState(false);
  const [decision, setDecision] = useState<null | "sign" | "reject">(null);
  const [, startTransition] = useTransition();

  if (!canSendToHr && !canResubmit && !canSign && !canRejectAsSupervisor) return null;

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
        {canSign ? (
          <Button variant="success" disabled={pending} onClick={() => setDecision("sign")}>
            Sign
          </Button>
        ) : null}
        {canRejectAsSupervisor ? (
          <Button variant="danger" disabled={pending} onClick={() => setDecision("reject")}>
            Reject
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

      <DecisionDialog
        open={decision === "sign"}
        title="Sign this request?"
        message="The employee can then send it to HR."
        confirmLabel="Sign"
        action={signLeave}
        requestId={requestId}
        onCancel={() => setDecision(null)}
      />
      <DecisionDialog
        open={decision === "reject"}
        title="Reject this request?"
        message="The employee will see your remark."
        confirmLabel="Reject"
        danger
        remark
        action={rejectBySupervisor}
        requestId={requestId}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}
