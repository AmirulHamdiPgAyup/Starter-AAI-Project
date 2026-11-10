"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createLeaveRequest } from "@/app/leave-actions";
import { LEAVE_TYPE_LABELS, type LeaveType } from "@/lib/constants";
import { countWorkingDays, parseDateInput, leaveDaysLabel } from "@/lib/leave";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SuccessModal } from "../ui/SuccessModal";
import { ErrorMessage, HelpText, Label, fieldClass } from "../ui/Field";

// The apply form (design §12), used by /employee/new. Submit asks for
// confirmation first, then shows a success message (brief rule 6).
export function LeaveForm({
  supervisors,
}: {
  supervisors: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createLeaveRequest, {});
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [toSend, setToSend] = useState<FormData | null>(null);
  const [, startTransition] = useTransition();

  // Live read-only working-day count; the server recomputes it on save.
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  const days = startDate && endDate ? countWorkingDays(startDate, endDate) : null;
  const dayHint =
    days === null
      ? null
      : days < 0
        ? "The end date cannot be before the start date."
        : days === 0
          ? "These dates contain no working days (weekends only)."
          : leaveDaysLabel(days);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        // Empty/invalid fields are stopped by the browser (required) above;
        // a weekend-only or reversed range never reaches the confirm box.
        if (pending || (days !== null && days <= 0)) return;
        setToSend(new FormData(e.currentTarget));
        setConfirming(true);
      }}
    >
      <ErrorMessage message={state.error} />

      <div>
        <Label htmlFor="leaveType">Leave type</Label>
        <select id="leaveType" name="leaveType" required className={fieldClass()}>
          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
            <option key={t} value={t}>
              {LEAVE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Start date</Label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className={fieldClass()}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End date</Label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            className={fieldClass()}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      {dayHint ? (
        <p
          className={
            days !== null && days > 0
              ? "text-sm font-medium text-brand-700"
              : "text-sm font-medium text-red-600"
          }
        >
          {days !== null && days > 0 ? `Working days: ${dayHint}` : dayHint}
        </p>
      ) : (
        <HelpText>Pick both dates to see the number of working days.</HelpText>
      )}

      <div>
        <Label htmlFor="supervisorId">Supervisor</Label>
        <select id="supervisorId" name="supervisorId" required className={fieldClass()}>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <HelpText>Only supervisors from your own division.</HelpText>
      </div>

      <div>
        <Label htmlFor="reason">Reason (optional)</Label>
        <textarea id="reason" name="reason" rows={3} className={fieldClass()} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || confirming}>
          {pending ? "Submitting…" : "Submit"}
        </Button>
        <Button variant="secondary" onClick={() => router.push("/employee")}>
          Cancel
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Submit leave request?"
        message="It will go to your supervisor for signing."
        confirmLabel="Submit"
        onConfirm={() => {
          setConfirming(false);
          if (toSend && !pending) startTransition(() => formAction(toSend));
        }}
        onCancel={() => setConfirming(false)}
      />

      <SuccessModal
        open={Boolean(state.ok)}
        title="Leave request submitted"
        message={state.message}
        actionLabel="Back to my requests"
        onAction={() => router.push("/employee")}
      />
    </form>
  );
}
