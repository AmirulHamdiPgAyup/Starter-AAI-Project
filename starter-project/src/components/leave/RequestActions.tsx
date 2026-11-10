"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  approveLeave,
  rejectByHr,
  rejectBySupervisor,
  sendToHr,
  signLeave,
} from "@/app/leave-actions";
import { Button, buttonClasses } from "../ui/Button";
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
  canApprove = false,
  canRejectAsHr = false,
}: {
  requestId: number;
  canSendToHr?: boolean;
  canResubmit?: boolean;
  canSign?: boolean;
  canRejectAsSupervisor?: boolean;
  canApprove?: boolean;
  canRejectAsHr?: boolean;
}) {
  const [state, action, pending] = useActionState(sendToHr, {});
  const [confirming, setConfirming] = useState(false);
  const [decision, setDecision] = useState<
    null | "sign" | "reject" | "approve" | "rejectAsHr"
  >(null);
  const [, startTransition] = useTransition();

  if (
    !canSendToHr &&
    !canResubmit &&
    !canSign &&
    !canRejectAsSupervisor &&
    !canApprove &&
    !canRejectAsHr
  )
    return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canSendToHr ? (
          <Button variant="secondary" disabled={pending} onClick={() => setConfirming(true)}>
            Send to HR
          </Button>
        ) : null}
        {canResubmit ? (
          // Opens the request view, where the prefilled form can be reopened
          // (Task 13). resubmitLeave re-checks owner and status on save.
          <Link
            href={`/employee/requests/${requestId}`}
            className={buttonClasses("secondary")}
          >
            Edit &amp; resubmit
          </Link>
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
        {canApprove ? (
          <Button variant="success" disabled={pending} onClick={() => setDecision("approve")}>
            Approve
          </Button>
        ) : null}
        {canRejectAsHr ? (
          <Button variant="danger" disabled={pending} onClick={() => setDecision("rejectAsHr")}>
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

      <DecisionDialog
        open={decision === "approve"}
        title="Approve this request?"
        message="The employee will see it as Approved."
        confirmLabel="Approve"
        action={approveLeave}
        requestId={requestId}
        onCancel={() => setDecision(null)}
      />
      <DecisionDialog
        open={decision === "rejectAsHr"}
        title="Reject this request?"
        message="The employee will see your remark."
        confirmLabel="Reject"
        danger
        remark
        action={rejectByHr}
        requestId={requestId}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}
